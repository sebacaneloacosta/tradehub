import React, { useState } from 'react';
import { ref, remove } from 'firebase/database';
import { database } from '../firebase';
import './DeleteProduct.css';

const DeleteProduct = ({ productId, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const productRef = ref(database, `products/${productId}`);
      await remove(productRef);
      
      if (onDeleteSuccess) {
        onDeleteSuccess(productId);
      }
    } catch (err) {
      setError('Error al eliminar publicacion. Intenta nuevamente.');
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="delete-product-container">
      {showConfirm ? (
        <div className="confirmation-dialog">
          <p>¿Estás seguro de eliminar esta publicacion?</p>
          <div className="confirmation-buttons">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="confirm-delete-btn"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button 
              onClick={() => setShowConfirm(false)}
              className="cancel-delete-btn"
            >
              Cancelar
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <button 
          onClick={() => setShowConfirm(true)}
          className="delete-btn"
        >
          Eliminar Publicacion
        </button>
      )}
    </div>
  );
};

export default DeleteProduct;