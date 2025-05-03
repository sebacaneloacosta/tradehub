import React from 'react';
import axios from 'axios';

function DeleteProduct({ productId }) {
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}/delete/`);
      console.log('Producto eliminado');
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  return <button onClick={handleDelete}>Eliminar Producto</button>;
}

export default DeleteProduct;
