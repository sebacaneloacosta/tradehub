import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../firebase';
import axios from 'axios';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Obtener usuario autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Obtener datos del carrito
  useEffect(() => {
    if (!currentUser) return;

    const cartRef = ref(database, `users/${currentUser.uid}/cart`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setCartItems(items);

        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setTotalAmount(total);
      } else {
        setCartItems([]);
        setTotalAmount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Crear transacción con backend
  const handlePay = async () => {
    if (totalAmount <= 0) {
      alert('El carrito está vacío.');
      return;
    }

    try {
      const idToken = await currentUser.getIdToken(); // Token de Firebase

      const response = await axios.post(
        'http://localhost:8000/api/payment/create-transaction/',
        {
          amount: totalAmount,
          // Podrías enviar también los productos si lo deseas
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const { token, url } = response.data;

      // Redirigir al formulario de pago de Transbank
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = token;

      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error('Error al crear la transacción:', error);
      alert('Error al procesar el pago.');
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="payment-container">
      <h2>Resumen del carrito</h2>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity} = ${item.price * item.quantity}
            </li>
          ))}
        </ul>
      )}
      <h3>Total: ${totalAmount}</h3>
      <button onClick={handlePay} disabled={cartItems.length === 0}>
        Pagar con Transbank
      </button>
    </div>
  );
};

export default Payment;
