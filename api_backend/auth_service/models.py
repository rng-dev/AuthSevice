from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    country = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    # last_login, is_active, username, password уже есть в AbstractUser
