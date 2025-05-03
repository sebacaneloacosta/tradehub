from rest_framework import viewsets, status
from .models import Item, Product
from .serializers import ItemSerializer, ProductSerializer
from rest_framework.permissions import IsAuthenticated
from firebase_admin import auth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render, redirect
from .forms import ProductForm
from django.contrib.auth.decorators import login_required


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Verificar token de Firebase
        id_token = self.request.META.get('HTTP_AUTHORIZATION').split(' ').pop()
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return super().get_queryset()
    
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # Vista para agregar un producto (POST)
@api_view(['POST'])
def create_product(request):
    if request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para editar un producto (PUT)
@api_view(['PUT'])
def update_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para eliminar un producto (DELETE)
@api_view(['DELETE'])
def delete_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@login_required
def create_product(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save(commit=False)
            product.user = request.user  # Asocia el producto al usuario actual
            product.save()
            return redirect('product_list')  # Redirige a la lista de productos
    else:
        form = ProductForm()
    return render(request, 'create_product.html', {'form': form})