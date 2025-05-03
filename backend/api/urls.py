from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, ProductViewSet
from . import views


router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('products/', views.create_product, name='create_product'),
    path('products/<int:pk>/', views.update_product, name='update_product'),
    path('products/<int:pk>/delete/', views.delete_product, name='delete_product'),
]