from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.PositiveIntegerField()
    stock = models.PositiveIntegerField()
    category = models.CharField(max_length=100)
    image_url = models.URLField(blank=True, null=True)
    
    def reduce_stock(self, quantity):
        """Reduce el stock de forma segura"""
        if self.stock >= quantity:
            self.stock -= quantity
            self.save()
        else:
            raise ValueError(f'Stock insuficiente. Disponible: {self.stock}')

    def __str__(self):
        return self.name