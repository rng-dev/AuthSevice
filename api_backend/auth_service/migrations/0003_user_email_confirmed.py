from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('auth_service', '0002_user_country_user_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_confirmed',
            field=models.BooleanField(default=False),
        ),
    ]
