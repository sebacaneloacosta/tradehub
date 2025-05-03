import React, { useState } from 'react';
import { database, ref, set, auth } from '../firebase'; // Asegúrate de que 'auth' esté exportado desde firebase.js
import './CreateProduct.css'; // Estilos opcionales para el modal

const CreateProduct = ({ onProductCreated, onClose }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert('Debes iniciar sesión para crear un producto.');
      return;
    }

    const productId = Date.now().toString(); // ID único basado en timestamp
    const productRef = ref(database, 'products/' + productId);

    await set(productRef, {
      name: productName,
      description: productDescription,
      price: productPrice,
      createdBy: user.uid, // 👈 Guardamos el UID del usuario
    });

    // Notificar al componente padre
    if (onProductCreated) {
      onProductCreated({
        id: productId,
        name: productName,
        description: productDescription,
        price: productPrice,
        createdBy: user.uid,
      });
    }

    // Limpiar formulario y cerrar
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    if (onClose) onClose();
  };

  return (
    <div className="create-product-overlay">
      <div className="create-product-container">
        <h2>Publicar producto a la venta</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción del Producto"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio del Producto"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
          <button type="submit">Crear Producto</button>
        </form>
        <button onClick={onClose} className="close-btn">Cerrar</button>
      </div>
    </div>
  );
};

export default CreateProduct;
