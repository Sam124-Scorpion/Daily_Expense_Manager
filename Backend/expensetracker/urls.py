from django.urls import path
from . import views

urlpatterns = [

    path("signup/", views.signup , name="signup"),
    path("login/", views.login , name="login"),
    path("add-expense/", views.add_expense , name="add-expense"),
    path("manage-expense/<int:user_id>/", views.manage_expense , name="manage-expense"),
    path("expenses/<int:expense_id>/", views.expense_detail , name="expense-detail"),
    path("ai/insights/<int:user_id>/", views.expense_ai_insights , name="expense-ai-insights"),

]
