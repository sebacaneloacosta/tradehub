import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [error, setError] = useState('');

  const handlePayment = () => {
    if (!paymentMethod) {
      setError('Por favor, elige un método de pago.');
      return;
    }

    if (paymentMethod === 'creditCard') {
      if (!cardNumber || !cardExpiry || !cardCVV) {
        setError('Por favor, completa los detalles de la tarjeta.');
        return;
      }

      console.log('Realizando pago con tarjeta de crédito...');
    }

    console.log('Pago realizado con éxito');
    navigate('/dashboard'); // Redirigir al dashboard u otra página post-pago
  };

  return (
    <div className="payment-container">
      <h1>Pagar</h1>
      <div className="payment-methods">
        <button 
          onClick={() => setPaymentMethod('creditCard')}
          className={paymentMethod === 'creditCard' ? 'active' : ''}
        >
          Tarjeta de Crédito
        </button>
      </div>

      {paymentMethod === 'creditCard' && (
        <div className="credit-card-form">
          <label>
            Número de tarjeta:
            <input 
              type="text" 
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value)} 
              placeholder="1234 5678 1234 5678"
            />
          </label>
          <label>
            Expiración:
            <input 
              type="text" 
              value={cardExpiry} 
              onChange={(e) => setCardExpiry(e.target.value)} 
              placeholder="MM/AA"
            />
          </label>
          <label>
            CVV:
            <input 
              type="text" 
              value={cardCVV} 
              onChange={(e) => setCardCVV(e.target.value)} 
              placeholder="123"
            />
          </label>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="amount">
        <h3>Monto: ${amount}</h3>
      </div>

      <button onClick={handlePayment} className="payment-button">
        Realizar Pago
      </button>
    </div>
  );
};

export default Payment;
