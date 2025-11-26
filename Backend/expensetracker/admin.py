from django.contrib import admin
from . models import UserDetails , ExpenseDetails
from . models import *

# Register your models here.

admin.site.register(UserDetails)
admin.site.register(ExpenseDetails)


