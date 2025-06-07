import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { useCart } from '../contexts/CartContext';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const categories = [
    'all',
    'tecnologia',
    'moda',
    'hogar',
    'deportes'
  ];

  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    const fetchProducts = onValue(productsRef, (snapshot) => {
      try {
        const productsData = [];
        snapshot.forEach((childSnapshot) => {
          const product = childSnapshot.val();
          if (product.status === 'active') { 
            productsData.push({
              id: childSnapshot.key,
              ...product
            });
          }
        });
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar productos');
        setLoading(false);
        console.error("Fetch error:", err);
      }
    }, (error) => {
      setError('Error de conexión');
      setLoading(false);
    });

    return () => off(productsRef, 'value', fetchProducts);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
    } else {
      alert('Este producto no tiene stock disponible');
    }
  };

  if (loading) return <div className="loading">Cargando publicaciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list-container">
      <h2>Publicaciones</h2>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-results">No se encontraron productos</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={product.image_url || '/default-product.png'} 
                  alt={product.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.src = '/default-product.png';
                  }}
                />
                {product.stock <= 0 && (
                  <span className="out-of-stock">AGOTADO</span>
                )}
              </div>
              
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="price-stock">
                  <span className="price">${product.price.toLocaleString('es-CL')}</span>
                  <span className={`stock ${product.stock <= 0 ? 'danger' : ''}`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`add-to-cart ${product.stock <= 0 ? 'disabled' : ''}`}
                >
                  {product.stock > 0 ? 'Agregar al carrito' : 'No disponible'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;