from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.mail import send_mail
import json

@csrf_exempt
def send_email_api(request):
    if request.method == "POST":
        data = json.loads(request.body)
        to_email = data.get("to_email")
        subject = data.get("subject")
        body = data.get("body")
        if not (to_email and subject and body):
            return JsonResponse({"error": "Missing fields"}, status=400)
        send_mail(subject, body, None, [to_email])
        return JsonResponse({"status": "ok"})
    return JsonResponse({"error": "Only POST allowed"}, status=405)

# Create your views here.
