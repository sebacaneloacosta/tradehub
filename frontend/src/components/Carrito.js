import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { reduceStock, createOrder } from '../api'; 

function Carrito() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleRemove = async (productId) => {
    try {
      const product = cart.find(item => item.id === productId);
      if (product) {
        await api.patch(`products/${productId}/`, { 
          stock: product.stock + product.quantity 
        });
      }
      removeFromCart(productId);
    } catch (err) {
      console.error("Error al revertir stock:", err);
      removeFromCart(productId);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // 1. Reducir stock para cada producto
      await Promise.all(
        cart.map(async (product) => {
          await reduceStock(product.id, product.quantity);
        })
      );

      // 2. Crear orden en el backend
      const orderItems = cart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { data: order } = await createOrder({
        items: orderItems,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });

      // 3. Limpiar carrito y redirigir
      clearCart();
      navigate(`/payment/${order.id}`); // Pasar ID de la orden
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la compra");
      console.error("Checkout error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="carrito-container">
      <h2>Carrito de Compras</h2>
      {error && <div className="error-message">{error}</div>}
      
      {cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          <div className="carrito-list">
            {cart.map((product) => (
              <div key={product.id} className="carrito-item">
                <img 
                  src={product.imageUrl || '/placeholder-product.png'} 
                  alt={product.name} 
                  className="product-image" 
                />
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p>Precio unitario: ${product.price.toLocaleString('es-CL')}</p>
                  <p>Cantidad: {product.quantity}</p>
                  <p>Subtotal: ${(product.price * product.quantity).toLocaleString('es-CL')}</p>
                </div>
                <button 
                  onClick={() => handleRemove(product.id)}
                  disabled={isProcessing}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="carrito-summary">
            <h3>Total: ${total.toLocaleString('es-CL')}</h3>
          </div>

          <div className="carrito-actions">
            <button 
              onClick={clearCart} 
              disabled={isProcessing}
              className="secondary-btn"
            >
              Vaciar Carrito
            </button>
            <button 
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className="primary-btn"
            >
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;
