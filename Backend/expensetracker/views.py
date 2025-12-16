import json
import os
from collections import Counter
from django.shortcuts import render
from django.http import HttpResponse , JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import requests
from . models import UserDetails , ExpenseDetails
# Create your views here.

@csrf_exempt
def signup(request):
   if request.method == 'POST':
       data = json.loads(request.body)
       fullname  = data.get('Fullname')
       email  = data.get('Email')
       password  = data.get('Password')

       if UserDetails.objects.filter(Email=email).exists():
          return JsonResponse({'message': 'Email already exists'}, status=400)
       UserDetails.objects.create(Fullname=fullname, Email=email, Password=password)
       return JsonResponse({'message': 'User registered successfully'}, status=201)
   
@csrf_exempt
def login(request):
      if request.method == 'POST':
       data = json.loads(request.body)
       email  = data.get('Email')
       password  = data.get('Password')

      try:
         user = UserDetails.objects.get(Email=email, Password=password)
         return JsonResponse({'message': 'Login successful' , 'userId': user.id , 'userName': user.Fullname , 'userEmail': user.Email }, status=201)
      except UserDetails.DoesNotExist:
         return JsonResponse({'message': 'Invalid email or password'}, status=400)
       
@csrf_exempt
def add_expense(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

        user_id = data.get('UserId')
        if not user_id or not str(user_id).isdigit():
            return JsonResponse({'message': 'Invalid user ID format'}, status=400)

        try:
            user = UserDetails.objects.get(id=user_id)
            ExpenseDetails.objects.create(
                User=user,   # <-- IMPORTANT FIX
                ExpenseDate=data.get('ExpenseDate'),
                ExpenseItem=data.get('ExpenseItem'),
                ExpenseCost=data.get('ExpenseCost')
            )
            return JsonResponse({'message': 'Expense added successfully'}, status=201)

        except UserDetails.DoesNotExist:
            return JsonResponse({'message': 'User does not exist'}, status=400)
        except Exception as e:
            return JsonResponse({'message': 'An error occurred', 'error': str(e)}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

   
@csrf_exempt
def manage_expense(request, user_id):
    if request.method == 'GET':
        try:
            expenses = ExpenseDetails.objects.filter(User_id=user_id).values(
                'id', 'ExpenseDate', 'ExpenseItem', 'ExpenseCost'
            )
            return JsonResponse({'expenses': list(expenses)}, status=200)
        except Exception as e:
            return JsonResponse({'message': 'Error fetching expenses', 'error': str(e)}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def expense_detail(request, expense_id):
    try:
        expense = ExpenseDetails.objects.get(id=expense_id)
    except ExpenseDetails.DoesNotExist:
        return JsonResponse({'message': 'Expense not found'}, status=404)

    if request.method in ['PUT', 'PATCH']:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

        expense_item = data.get('ExpenseItem')
        expense_cost = data.get('ExpenseCost')

        if expense_item is None and expense_cost is None:
            return JsonResponse({'message': 'No fields provided for update'}, status=400)

        if expense_item is not None:
            expense.ExpenseItem = expense_item

        if expense_cost is not None:
            try:
                expense.ExpenseCost = float(expense_cost)
            except (TypeError, ValueError):
                return JsonResponse({'message': 'Invalid ExpenseCost value'}, status=400)

        expense.save()
        return JsonResponse({'message': 'Expense updated successfully'}, status=200)

    if request.method == 'DELETE':
        expense.delete()
        return JsonResponse({'message': 'Expense deleted successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)


@csrf_exempt
def expense_ai_insights(request, user_id):
    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    expenses = list(
        ExpenseDetails.objects.filter(User_id=user_id)
        .order_by('-ExpenseDate')
        .values('ExpenseDate', 'ExpenseItem', 'ExpenseCost')[:100]
    )

    if not expenses:
        return JsonResponse({'message': 'No expenses found for user', 'provider': 'none'}, status=404)

    total_expenses = sum(float(e.get('ExpenseCost') or 0) for e in expenses)
    avg_expense = total_expenses / len(expenses) if expenses else 0

    def generate_fallback_insights():
        costs = [float(e.get('ExpenseCost') or 0) for e in expenses if e.get('ExpenseCost') is not None]
        items = [(e.get('ExpenseItem') or 'Other').strip() or 'Other' for e in expenses]
        item_totals = {}
        for e in expenses:
            key = (e.get('ExpenseItem') or 'Other').strip() or 'Other'
            try:
                item_totals[key] = item_totals.get(key, 0) + float(e.get('ExpenseCost') or 0)
            except Exception:
                pass

        top_items = sorted(item_totals.items(), key=lambda kv: kv[1], reverse=True)[:3]
        frequent_items = Counter(items).most_common(2)
        small_spends = [c for c in costs if c < (avg_expense * 0.5 if avg_expense else 0)]

        lines = []
        if top_items:
            parts = [f"{name}: ₹{amt:,.0f}" for name, amt in top_items]
            lines.append(f"Top spend categories -> {', '.join(parts)}.")
        if frequent_items:
            freq = [f"{name} x{cnt}" for name, cnt in frequent_items]
            lines.append(f"Most frequent items -> {', '.join(freq)}.")
        if small_spends and len(small_spends) >= 3:
            lines.append("Many small purchases detected; try batching or weekly caps.")
        if avg_expense:
            lines.append(f"Average per expense: ₹{avg_expense:,.0f}. Set a per-purchase limit to stay on budget.")
        lines.append("Pick one top category and aim to trim 10-15% this month.")

        return "\n".join(f"- {line}" for line in lines) if lines else "- Keep tracking; not enough data for insights yet."

    def build_prompt():
        summary_lines = [
            f"Total expenses: ₹{total_expenses:,.2f}",
            f"Average per expense: ₹{avg_expense:,.2f}",
            f"Expense count: {len(expenses)}",
        ]
        top_counts = Counter((e.get('ExpenseItem') or 'Other').strip() or 'Other' for e in expenses).most_common(5)
        if top_counts:
            summary_lines.append(
                "Top items: " + ", ".join([f"{name} x{cnt}" for name, cnt in top_counts])
            )
        details = "\n".join(
            [f"- {e.get('ExpenseItem') or 'Item'} | ₹{float(e.get('ExpenseCost') or 0):.2f}" for e in expenses[:30]]
        )
        prompt = (
            "You are a concise financial coach."
            " Give 3-5 bullet insights and 2 actionable suggestions tailored to the data."
            " Avoid repeating the raw numbers; focus on patterns and next steps."
            " Keep it under 120 words."
            f"\nSummary:\n{os.linesep.join(summary_lines)}\nDetails:\n{details}"
        )
        return prompt

    def call_gemini(prompt_text):
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return None, 'GEMINI_API_KEY not configured'

        # Allow overriding the Gemini model via env; default to requested 2.5 Flash
        model = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        params = {'key': api_key}
        payload = {
            "contents": [
                {"parts": [{"text": prompt_text}]}
            ]
        }

        response = requests.post(url, params=params, json=payload, timeout=30)
        if response.status_code == 429:
            return 'quota', 'Gemini quota exceeded'
        if not response.ok:
            return None, f"Gemini API error: {response.status_code} {response.text}"
        data = response.json()
        try:
            text = data['candidates'][0]['content']['parts'][0]['text']
            return text.strip(), None
        except Exception as exc:  # keep narrow surface
            return None, f"Gemini response parse error: {exc}"

    def call_openai(prompt_text):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return None, 'OPENAI_API_KEY not configured'
        try:
            from openai import OpenAI
        except ImportError:
            return None, 'OpenAI package not installed'

        try:
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a concise financial coach for personal expenses."},
                    {"role": "user", "content": prompt_text},
                ],
                max_tokens=300,
                temperature=0.6,
            )
            if response.choices and response.choices[0].message.content:
                return response.choices[0].message.content.strip(), None
            return None, 'OpenAI returned empty response'
        except Exception as exc:
            status_code = (
                getattr(getattr(exc, 'response', None), 'status_code', None)
                or getattr(exc, 'status_code', None)
                or getattr(exc, 'http_status', None)
            )
            if status_code == 429 or 'insufficient_quota' in str(exc).lower():
                return 'quota', 'OpenAI quota exceeded'
            return None, f"OpenAI API error: {exc}"

    provider = (request.GET.get('provider') or 'gemini').lower()
    prompt = build_prompt()

    if provider == 'gemini':
        insight, err = call_gemini(prompt)
        if insight == 'quota':
            insight = generate_fallback_insights()
            return JsonResponse({
                'insight': insight,
                'provider': 'fallback',
                'note': 'Gemini quota exceeded; showing local insights.',
                'total_expenses': total_expenses,
                'average_expense': avg_expense,
                'expense_count': len(expenses)
            }, status=200)
        if insight:
            return JsonResponse({
                'insight': insight,
                'provider': 'gemini',
                'total_expenses': total_expenses,
                'average_expense': avg_expense,
                'expense_count': len(expenses)
            }, status=200)

    if provider == 'openai':
        insight, err = call_openai(prompt)
        if insight == 'quota':
            insight = generate_fallback_insights()
            return JsonResponse({
                'insight': insight,
                'provider': 'fallback',
                'note': 'OpenAI quota exceeded; showing local insights.',
                'total_expenses': total_expenses,
                'average_expense': avg_expense,
                'expense_count': len(expenses)
            }, status=200)
        if insight:
            return JsonResponse({
                'insight': insight,
                'provider': 'openai',
                'total_expenses': total_expenses,
                'average_expense': avg_expense,
                'expense_count': len(expenses)
            }, status=200)

    # If provider missing or errors, return fallback insights
    return JsonResponse({
        'insight': generate_fallback_insights(),
        'provider': 'fallback',
        'note': err if 'err' in locals() else 'Using local fallback insights.',
        'total_expenses': total_expenses,
        'average_expense': avg_expense,
        'expense_count': len(expenses)
    }, status=200)


