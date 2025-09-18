from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile
import random

@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    otp = random.randint(100000, 999999)
    request.session['otp'] = otp
    request.session['email'] = email

    subject = 'Your OTP for registration'
    message = f'Your OTP is: {otp}'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]

    try:
        send_mail(subject, message, from_email, recipient_list)
    except Exception as e:
        return Response({'error': 'Failed to send OTP'}, status=500)

    return Response({'message': 'OTP sent successfully'})

@api_view(['POST'])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    phone = request.data.get('phone')

    if not all([email, password]):
        return Response({'error': 'Email and password are required'}, status=400)

    try:
        user = User.objects.create_user(username=email, email=email, password=password, first_name=first_name, last_name=last_name)
        Profile.objects.create(user=user, phone=phone)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

    return Response({'message': 'User created successfully'})

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not all([email, password]):
        return Response({'error': 'Email and password are required'}, status=400)

    user = authenticate(username=email, password=password)

    if not user:
        return Response({'error': 'Invalid credentials'}, status=400)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    })