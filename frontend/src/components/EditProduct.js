import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import './EditProduct.css';

const EditProduct = ({ productId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = ref(database, `products/${productId}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          setFormData(snapshot.val());
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.price <= 0) throw new Error('El precio debe ser mayor a 0');
      if (formData.stock < 0) throw new Error('El stock no puede ser negativo');

      const productRef = ref(database, `products/${productId}`);
      await update(productRef, {
        ...formData,
        updated_at: new Date().toISOString() 
      });

      if (onUpdate) onUpdate();
      if (onClose) onClose();  
      
    } catch (err) {
      setError(err.message);
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-message">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-product-container">
      <h2>Editar Producto</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Precio (CLP):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Categoría:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="general">General</option>
            <option value="electronica">Electrónica</option>
            <option value="moda/vestuario">Moda/Vesturario</option>
            <option value="hogar">Hogar</option>
            <option value="deportes">Deportes</option>
          </select>
        </div>

        <div className="form-group">
          <label>Imagen URL:</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="cancel-btn"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="save-btn"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
