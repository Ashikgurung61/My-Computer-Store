from django.db import migrations

def calculate_price_after_discount(apps, schema_editor):
    Product = apps.get_model('api', 'Product')
    for product in Product.objects.all():
        if product.discount is not None and product.price is not None:
            discount_amount = (product.discount / 100) * product.price
            product.price_after_discount = product.price - discount_amount
        else:
            product.price_after_discount = product.price
        product.save(update_fields=['price_after_discount'])

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_product_price_after_discount'),
    ]

    operations = [
        migrations.RunPython(calculate_price_after_discount),
    ]