from django.urls import path
from .views import MeView, RegisterView, login_view, password_reset_view

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", login_view),
    path("password-reset/", password_reset_view),
    path("me/", MeView.as_view()),
]
