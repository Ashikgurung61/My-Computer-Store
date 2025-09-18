from django.urls import path
from .views import send_otp, signup, login

urlpatterns = [
    path('send-otp/', send_otp, name='send-otp'),
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
]