from django.http import JsonResponse
from django.urls import path


def index(request):
    return JsonResponse({
        "app": "{{PROJECT_NAME}}",
        "framework": "django",
        "db": "{{DB}}",
        "message": "Hello from Polystack!",
    })


urlpatterns = [
    path("", index),
]
