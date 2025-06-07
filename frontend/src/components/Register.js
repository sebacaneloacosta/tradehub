import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const saveUserToDatabase = (user) => {
    if (!user) return;
    const userRef = ref(database, `users/${user.uid}`);
    return set(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || displayName || '',
      createdAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await registerUser(email, password, displayName);

      if (result.success) {
        const user = result.user;

        await updateProfile(user, { displayName });

        await saveUserToDatabase({ ...user, displayName });

        const auth = getAuth();
        await signOut(auth);

        setTimeout(() => {
          setSuccess(true);
        }, 300); 
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="register-form">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>¡Registro Exitoso!</h2>
            <p>Hemos enviado un email de verificación a <strong>{email}</strong></p>
            <p>Por favor verifica tu correo para poder iniciar sesión.</p>
            <Link to="/login" className="success-btn">
              Ir al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="register-form">
        <h2>Crear Cuenta</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre y Apellido</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Ej: Fernando Zampedri"
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="alguien@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              placeholder="••••••"
            />
            <div className="password-requirements">
              <ul>
                <li>Mínimo 6 caracteres</li>
                <li>Usa mayúsculas y números para mayor seguridad</li>
              </ul>
            </div>
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-links">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
          <p><Link to="/">← Volver al inicio</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
