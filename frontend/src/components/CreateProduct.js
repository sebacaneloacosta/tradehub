import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { database, auth } from '../firebase';
import './CreateProduct.css';

const CreateProduct = ({ onProductCreated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'general',
    image_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!auth.currentUser) throw new Error('Debes iniciar sesión');

      if (!formData.name.trim()) throw new Error('El nombre no puede estar vacío');
      if (!formData.description.trim()) throw new Error('La descripción no puede estar vacía');

      const priceNum = Number(formData.price);
      const stockNum = Number(formData.stock);

      if (isNaN(priceNum) || priceNum <= 0) throw new Error('El precio debe ser un número mayor a 0');
      if (isNaN(stockNum) || stockNum < 0) throw new Error('El stock debe ser un número igual o mayor a 0');

      // Usar push para id único
      const productsRef = ref(database, 'products');
      const newProductRef = push(productsRef);

      await set(newProductRef, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        stock: stockNum,
        category: formData.category,
        image_url: formData.image_url.trim(),
        created_at: new Date().toISOString(),
        seller_uid: auth.currentUser.uid,
        status: 'active'
      });

      if (onProductCreated) onProductCreated({ id: newProductRef.key, ...formData });

      // Limpiar formulario tras éxito
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'general',
        image_url: ''
      });

      if (onClose) onClose();

    } catch (err) {
      setError(err.message);
      console.error("Error creating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-product-overlay">
      <div className="create-product-container">
        <button onClick={onClose} className="close-btn">×</button>
        <h2>Informacion del articulo</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Descripción detallada"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />

          <div className="form-row">
            <input
              type="number"
              name="price"
              placeholder="Precio"
              value={formData.price}
              onChange={handleChange}
              min="10"
              required
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock disponible"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <select 
            name="category" 
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="general">General</option>
            <option value="electronica">Electrónica</option>
            <option value="moda/vestuario">Moda/Vestuario</option>
            <option value="hogar">Hogar</option>
            <option value="deportes">Deportes</option>
          </select>

          <input
            type="url"
            name="image_url"
            placeholder="URL de la imagen (opcional)"
            value={formData.image_url}
            onChange={handleChange}
          />

          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
