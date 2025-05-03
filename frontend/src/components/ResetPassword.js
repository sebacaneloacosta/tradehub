import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../firebase';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>Email enviado</h2>
        <p>Hemos enviado un enlace para restablecer tu contraseña a {email}</p>
        <p>Serás redirigido al login...</p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>Recuperar Contraseña</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Enviar enlace</button>
      </form>
      <p className="auth-switch">
        ¿Recordaste tu contraseña? <span onClick={() => navigate('/')}>Inicia sesión</span>
      </p>
    </div>
  );
}

export default ResetPassword;