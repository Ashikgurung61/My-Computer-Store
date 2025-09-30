from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CartViewSet, send_otp, signup, login, CategoryViewSet, CartItemViewSet, AddressViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart/items', CartItemViewSet, basename='cart-item')
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('', include(router.urls)),
    path('send-otp/', send_otp, name='send-otp'),
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
]