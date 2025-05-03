from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    category = models.CharField(max_length=100)
    image_url = models.URLField(blank=True, null=True)
    
    def reduce_stock_on_purchase(product_id, quantity):
        product = Product.objects.get(id=product_id)
        if product.stock >= quantity:
            product.stock -= quantity
            product.save()
        else:
            raise ValueError('Stock insuficiente')


    def __str__(self):
        return self.name
    
    