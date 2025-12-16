import json
import os
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

    try:
        user = UserDetails.objects.get(id=user_id)
    except UserDetails.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=404)

    expenses = list(
        ExpenseDetails.objects.filter(User_id=user_id)
        .order_by('-ExpenseDate')
        .values('ExpenseDate', 'ExpenseItem', 'ExpenseCost')[:100]
    )

    if not expenses:
        return JsonResponse({'message': 'No expenses available to analyse'}, status=400)

    def to_line(expense):
        date = expense.get('ExpenseDate')
        if date:
            try:
                date_str = timezone.localtime(date).strftime('%Y-%m-%d')
            except Exception:
                date_str = str(date)
        else:
            date_str = 'Unknown date'
        item = expense.get('ExpenseItem') or 'Unknown item'
        cost = expense.get('ExpenseCost') or 0
        return f"{date_str}: {item} - ₹{cost}"

    sample_lines = [to_line(expense) for expense in expenses[:20]]
    gemini_key = os.environ.get('GEMINI_API_KEY')

    def build_fallback(provider_hint='fallback'):
        fallback = [
            f"You logged {len(expenses)} expenses recently.",
            f"Sample entry: {sample_lines[0]}" if sample_lines else "Add more entries to see patterns.",
            "Review recurring costs and set a budget alert for top categories.",
            "Configure a Gemini API key to unlock AI-authored insights." if provider_hint == 'no-key'
            else "We will keep trying to reach the AI service; please retry shortly."
        ]
        return JsonResponse({
            'insight': '\n'.join(fallback),
            'provider': provider_hint
        }, status=200)

    if not gemini_key:
        return build_fallback('no-key')

    prompt = (
        "You are a concise financial coach. The following are recent expenses:\n"
        f"{chr(10).join(sample_lines)}\n\n"
        "Provide four short bullet insights in second person, highlighting spending patterns, "
        "potential savings, and encouragement. Keep it under 120 words."
    )

    try:
        import google.generativeai as genai
        
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-pro')
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            ai_text = response.text.strip()
            return JsonResponse({
                'insight': ai_text,
                'provider': 'gemini'
            }, status=200)
        else:
            print("Gemini returned empty response")
            return build_fallback('service-error')
            
    except ImportError:
        print("google-generativeai package not installed")
        return JsonResponse({
            'message': 'Please install google-generativeai package: pip install google-generativeai',
            'provider': 'error'
        }, status=500)
    except Exception as e:
        print(f"Gemini error: {e}")
        return build_fallback('service-error')

