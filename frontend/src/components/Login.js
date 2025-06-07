import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithEmail } from '../firebase';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const saveUserToDatabase = (user) => {
    if (!user) return;
    const userRef = ref(database, `users/${user.uid}`);
    return set(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      lastLogin: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginWithEmail(email, password);

      if (result.success) {
        if (!result.user.emailVerified) {
          setError('Por favor verifica tu email antes de iniciar sesión');
          setLoading(false);
          return;
        }

        await saveUserToDatabase(result.user);

        const token = await result.user.getIdToken();
        localStorage.setItem('firebaseToken', token);
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Iniciar Sesión</h2>
        </div>

        <div className="auth-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alguien@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••"
                minLength="6"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Iniciando Sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="auth-link">
                Regístrate aquí
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="auth-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            <p>
              <Link to="/" className="auth-link">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
