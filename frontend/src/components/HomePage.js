import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Bienvenido a TradeHub</h1>
        <p>La plataforma ideal para publicar la venta de tus productos</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn primary">Regístrate Gratis</Link>
          <Link to="/login" className="btn secondary">Iniciar Sesión</Link>
        </div>
      </header>

      <section className="features">
        <h2>Nuestras Características</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Intercambio Seguro</h3>
            <p>Sistema de reputación y verificación de usuarios</p>
          </div>
          <div className="card">
            <h3>Amplio Catálogo</h3>
            <p>Encuentra productos de todo tipo para intercambiar</p>
          </div>
          <div className="card">
            <h3>Comunidad Activa</h3>
            <p>Conecta con otros usuarios interesados en el trueque</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;