import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Category

image_dir = '../../computer_ecommerce/frontend/src/assets/images'

for filename in os.listdir(image_dir):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        category_name = os.path.splitext(filename)[0]
        Category.objects.get_or_create(name=category_name)

print('Categories populated successfully!')
