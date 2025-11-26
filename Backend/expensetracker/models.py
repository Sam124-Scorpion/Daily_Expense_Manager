from django.db import models

# Create your models here.



class UserDetails(models.Model):
    Fullname = models.CharField(max_length=100)
    Email = models.EmailField(unique=True , max_length=100)
    Password = models.CharField(max_length=50)
    Registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.Fullname

class ExpenseDetails(models.Model):
    User = models.ForeignKey(UserDetails, on_delete=models.CASCADE)
    # Expense_amount = models.FloatField()
    # Expense_category = models.CharField(max_length=50)
    ExpenseDate = models.DateTimeField(auto_now_add=True , null=True , blank=True)
    ExpenseItem = models.CharField(max_length=100)
    ExpenseCost = models.FloatField()
    NoteDate = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.User.Fullname} - {self.ExpenseItem} - {self.ExpenseCost}"


#python manage.py createsuperuser for creating admin user