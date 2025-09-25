from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=5, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.user.username

class Product(models.Model):
    # General Information
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True, null=True)
    model_name = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    # Core Specifications
    processor_brand = models.CharField(max_length=100, blank=True, null=True)
    processor_name = models.CharField(max_length=100, blank=True, null=True)
    ram_size = models.CharField(max_length=50, blank=True, null=True)
    ram_type = models.CharField(max_length=50, blank=True, null=True)
    storage_type = models.CharField(max_length=50, blank=True, null=True)
    storage_capacity = models.CharField(max_length=50, blank=True, null=True)

    # Display
    screen_size = models.CharField(max_length=50, blank=True, null=True)
    screen_resolution = models.CharField(max_length=50, blank=True, null=True)
    screen_type = models.CharField(max_length=100, blank=True, null=True)

    # Graphics
    graphics_processor = models.CharField(max_length=100, blank=True, null=True)

    # Other
    os = models.CharField(max_length=100, blank=True, null=True)
    warranty = models.CharField(max_length=255, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} in {self.cart.user.username}'s cart"