import React from 'react';
import './CartItem.css';


const CartItem = ({ item, onRemove }) => {
  return (
    <div className="cart-item">
      <img 
        src={item.image_url || '/default-product.jpg'} 
        alt={item.name}
        className="item-image"
      />
      <div className="item-details">
        <h3>{item.name}</h3>
        <p>${item.price.toLocaleString('es-CL')} x {item.quantity}</p>
        <p>Subtotal: ${(item.price * item.quantity).toLocaleString('es-CL')}</p>
      </div>
      <button 
        className="remove-btn"
        onClick={() => onRemove(item.id)}
      >
        Eliminar
      </button>
    </div>
  );
};

export default CartItem;