import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, push, set, remove } from 'firebase/database'; 
import './Dashboard.css';
import CreateProduct from './CreateProduct';  // Importa el componente CreateProduct

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [publicProducts, setPublicProducts] = useState([]);
  const [cart, setCart] = useState([]);  // Estado para el carrito
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    const db = getDatabase();
    const productsRef = ref(db, 'products/');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        const userProducts = allProducts.filter(product => product.createdBy === user?.uid);
        setProducts(userProducts);
        const otherProducts = allProducts.filter(product => product.createdBy !== user?.uid);
        setPublicProducts(otherProducts);
      } else {
        setProducts([]);
        setPublicProducts([]);
      }
    });

    return () => unsubscribe();
  }, [navigate, user?.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAddProductClick = () => {
    setShowCreateProductForm(true);
  };

  const handleProductCreated = (newProduct) => {
    const db = getDatabase();
    const productsRef = ref(db, 'products/');
    const newProductRef = push(productsRef);
    set(newProductRef, newProduct)
      .then(() => {
        setShowCreateProductForm(false);
      })
      .catch((error) => {
        console.error('Error al agregar producto:', error);
      });
  };

  const handleDeleteProduct = (productId) => {
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    remove(productRef)
      .then(() => {
        setProducts(products.filter(product => product.id !== productId));
      })
      .catch((error) => {
        console.error('Error al eliminar el producto:', error);
      });
  };

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    // Redirigir a la pestaña de "Carrito"
    setActiveTab('carrito');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>TradeHub</h2>
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.displayName || 'Usuario'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            Inicio
          </button>
          <button 
            className={`nav-item ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            Mis Productos
          </button>
          <button 
            className={`nav-item ${activeTab === 'publicados' ? 'active' : ''}`}
            onClick={() => setActiveTab('publicados')}
          >
            Publicaciones
          </button>
          <button 
            className={`nav-item ${activeTab === 'carrito' ? 'active' : ''}`}
            onClick={() => setActiveTab('carrito')}
          >
            Carrito
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="content-header">
          <h1>
            {activeTab === 'inicio' && 'Bienvenido a TradeHub'}
            {activeTab === 'productos' && 'Mis Productos'}
            {activeTab === 'publicados' && 'Productos Públicos'}
            {activeTab === 'carrito' && 'Tu Carrito'}
          </h1>
          <button className="add-product-btn" onClick={handleAddProductClick}>
            Añadir Producto
          </button>
        </header>

        <main className="content-main">
          {activeTab === 'productos' && (
            <div className="productos-section">
              <div className="section-header">
                <h2>Tus publicaciones</h2>
              </div>
              <div className="products-grid">
                {products.length === 0 ? (
                  <p>Aún no has publicado ningún producto</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-card">
                      <img src={product.imageUrl} alt={product.name} className="product-image" />
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <p className="product-price">Precio: ${product.price}</p>
                      <button
                        className="delete-product-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Eliminar Producto
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'publicados' && (
            <div className="productos-publicos-section">
              <div className="section-header">
                <h2>Publicaciones activas</h2>
              </div>
              <div className="products-grid">
                {publicProducts.length === 0 ? (
                  <p>No hay publicaciones activas</p>
                ) : (
                  publicProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <img src={product.imageUrl} alt={product.name} className="product-image" />
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <p className="product-price">Precio: ${product.price}</p>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'carrito' && (
            <div className="carrito-section">
              <h2>Carrito de compra</h2>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p>Tu carrito está vacío</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                      <h3>{item.name}</h3>
                      <p>Precio: ${item.price}</p>
                      <button
                        className="remove-from-cart-btn"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Realizar pago
              </button>
            </div>
          )}

          {showCreateProductForm && (
            <CreateProduct
              onProductCreated={handleProductCreated}
              onClose={() => setShowCreateProductForm(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
