import React from 'react';
import './ProductCard.css';


const ProductCard = ({ product, onDelete, onAddToCart, isOwner }) => {
  return (
    <div className={`product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
      <img 
        src={product.image_url || '/default-product.jpg'} 
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <div className="price-stock">
          <div>
          <span className="price">${product.price.toLocaleString('es-CL')}</span>
          </div>
          <div>
          <span className="stock">
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
          </div>
        </div>
      </div>
      <div className="product-actions">
        {isOwner ? (
          <button 
            className="delete-btn"
            onClick={() => onDelete(product.id)}
          >
            Eliminar
          </button>
        ) : (
          <button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Añadir al carrito' : 'Sin stock'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;