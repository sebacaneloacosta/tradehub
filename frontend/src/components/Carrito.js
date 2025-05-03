import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

function Carrito() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    navigate('/payment'); // ✅ Redirige a la página de pago correctamente
  };

  return (
    <div className="carrito-container">
      <h2>Carrito de Compras</h2>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <div className="carrito-list">
          {cart.map((product) => (
            <div key={product.id} className="carrito-item">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Precio: ${product.price}</p>
                <p>Cantidad: {product.quantity}</p>
              </div>
              <button onClick={() => handleRemove(product.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <div className="carrito-actions">
          <button onClick={handleClearCart}>Vaciar Carrito</button>
          <button onClick={handleCheckout}>Proceder al pago</button>
        </div>
      )}
    </div>
  );
}

export default Carrito;
