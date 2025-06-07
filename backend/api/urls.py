from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, create_transaction  

router = DefaultRouter()
router.register(r'products', ProductViewSet) 

urlpatterns = [
    path('api/', include(router.urls)),  # Todas las operaciones API (GET/POST/PUT/DELETE)
    path('payment/create-transaction/', create_transaction, name='create-transaction'),  
]
