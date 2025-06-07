import React, { useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import ProductCard from './ProductCard'; 

function UserProducts() {
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setUserProducts([]);
      }
      setLoading(false);
    });

    if (!user) return;

    const productsRef = ref(database, 'products/');
    const unsubscribeProducts = onValue(productsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Filtra solo productos creados por el usuario logueado
        const filtered = productsArray.filter(p => p.createdBy === user.uid);
        setUserProducts(filtered);
      } else {
        setUserProducts([]);
      }
    });

    return () => {
      unsubscribeAuth();
      productsRef.off && productsRef.off('value');
    };
  }, [user]);

  if (loading) return <p>Cargando publicaciones...</p>;
  if (!user) return <p>Tu cuenta no ha sido verificada</p>;

  return (
    <div>
      <h2>Mis Publicaciones ({userProducts.length})</h2>
      {userProducts.length === 0 && <p>No tienes publicaciones activas.</p>}
      <div className="products-grid">
        {userProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            isOwner={true}
          />
        ))}
      </div>
    </div>
  );
}

export default UserProducts;
