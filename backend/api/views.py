import time
import traceback
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Product
from .serializers import ProductSerializer
from django.shortcuts import get_object_or_404
from django.http import Http404

from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.webpay.webpay_plus.transaction import WebpayOptions
from django.conf import settings


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def reduce_stock(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get('quantity', 1))
        try:
            product.reduce_stock(quantity)
            return Response({'status': 'stock updated'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    """
    Recibe carrito (productos y cantidades), valida stock y monto,
    crea transacción Transbank y devuelve token y URL de pago.
    """
    try:
        cart = request.data.get('cart', [])
        if not cart:
            return Response({'error': 'Carrito vacío'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = 0
        products_info = []
        
        for item in cart:
            product_name = item.get('product_name', '').strip()
            quantity = int(item.get('quantity', 1))

            if not product_name:
                return Response({'error': 'El nombre del producto es requerido'}, 
                               status=status.HTTP_400_BAD_REQUEST)

            try:
                product = get_object_or_404(Product, name__iexact=product_name)
            except Http404:
                return Response({'error': f'Producto "{product_name}" no encontrado'}, 
                              status=status.HTTP_404_NOT_FOUND)

            if product.stock < quantity:
                return Response({'error': f'Stock insuficiente para {product.name}. Disponible: {product.stock}'}, 
                               status=status.HTTP_400_BAD_REQUEST)

            total_amount += product.price * quantity
            products_info.append({
                'product': product.id,
                'quantity': quantity,
                'price': product.price
            })

        if total_amount <= 0:
            return Response({'error': 'Monto inválido'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        buy_order = f"order_{request.user.id}_{int(time.time())}"
        session_id = str(request.user.id)
        return_url = settings.TRANSBANK_RETURN_URL

        transaction = Transaction(WebpayOptions.for_testing())
        response = transaction.create(buy_order, session_id, return_url, int(total_amount))

        return Response({
            'token': response.token,
            'url': response.url,
            'buy_order': buy_order,
            'amount': total_amount,
            'products': products_info  # Información adicional de los productos
        })

    except Exception as e:
        traceback.print_exc()
        return Response({'error': 'Error al procesar la transacción: ' + str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_transaction(request):
    """
    Confirmar transacción después del pago.
    Recibe token_ws, valida pago y actualiza stock si es autorizado.
    """
    try:
        token = request.data.get('token_ws')
        cart = request.data.get('cart', [])

        if not token:
            return Response({'error': 'Token es requerido'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        if not cart:
            return Response({'error': 'Carrito es requerido para actualizar stock'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        transaction = Transaction(WebpayOptions.for_testing())
        response = transaction.commit(token)

        if response.status == 'AUTHORIZED':
            for item in cart:
                product_name = item.get('product_name', '').strip()
                quantity = int(item.get('quantity', 1))

                if not product_name:
                    continue

                try:
                    product = get_object_or_404(Product, name__iexact=product_name)
                    product.reduce_stock(quantity)
                    product.save()
                except (Http404, ValueError) as e:
                    # Registrar el error pero continuar con otros productos
                    print(f"Error al actualizar stock para {product_name}: {str(e)}")
                    continue

            return Response({
                'message': 'Pago autorizado y stock actualizado',
                'transaction_data': {
                    'amount': response.amount,
                    'authorization_code': response.authorization_code,
                    'transaction_date': response.transaction_date
                }
            })
        else:
            return Response({
                'message': 'Pago no autorizado',
                'transaction_status': response.status,
                'response_code': response.response_code
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        traceback.print_exc()
        return Response({'error': 'Error al confirmar la transacción: ' + str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)