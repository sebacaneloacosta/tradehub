import React, { useEffect, useState, useMemo } from 'react';
import { auth, database } from '../firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import CreateProduct from './CreateProduct';
import ProductCard from './ProductCard';
import CartItem from './CartItem';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();

  // Separar productos propios y públicos
  const [userProducts, publicProducts] = useMemo(() => {
    if (!user?.uid) return [[], []];
    return products.reduce(([userProds, publicProds], product) => {
      return product.seller_uid === user.uid
        ? [[...userProds, product], publicProds]
        : [userProds, [...publicProds, product]];
    }, [[], []]);
  }, [products, user?.uid]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    const productsRef = ref(database, 'products/');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedProducts = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        status: data[key].status || 'active'
      })) : [];
      setProducts(loadedProducts);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const productsRef = ref(database, 'products');
      const newProductRef = push(productsRef);
      await set(newProductRef, {
        ...newProduct,
        seller_uid: user.uid,
        created_at: new Date().toISOString(),
        status: 'active'
      });
      setShowCreateProductForm(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const productRef = ref(database, `products/${productId}`);
      await remove(productRef);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const totalCartAmount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setPaymentError('Tu carrito está vacío');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://127.0.0.1:8000/api/payment/create-transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart: cart.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la transacción');
      }

      // Redirigir a la página de pago de Transbank
      if (data.url && data.token) {
        // Guardar el carrito en localStorage por si necesitamos recuperarlo
        localStorage.setItem('pendingPaymentCart', JSON.stringify(cart));
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      setPaymentError(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
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
          {['inicio', 'productos', 'publicados', 'carrito'].map((tab) => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="content-header">
          <h1>
            {{
              inicio: 'Bienvenido a TradeHub',
              productos: 'Mis Publicaciones',
              publicados: 'Publicaciones Activas',
              carrito: 'Tu Carrito'
            }[activeTab]}
          </h1>
          {activeTab === 'productos' && (
            <button
              className="add-product-btn"
              onClick={() => setShowCreateProductForm(true)}
            >
              Publicar artículo
            </button>
          )}
        </header>

        <main className="content-main">
          {activeTab === 'productos' && (
            <div className="products-section">
              <h2>Tus publicaciones ({userProducts.length})</h2>
              <div className="products-grid">
                {userProducts.length > 0 ? (
                  userProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onDelete={handleDeleteProduct}
                      isOwner
                    />
                  ))
                ) : (
                  <p className="empty-message">Aún no has publicado nada</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'publicados' && (
            <div className="products-section">
              <h2>Publicaciones activas ({publicProducts.length})</h2>
              <div className="products-grid">
                {publicProducts.length > 0 ? (
                  publicProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <p className="empty-message">No hay publicaciones activas en este momento</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'carrito' && (
            <div className="cart-section">
              <h2>Tu carrito ({cart.length} items)</h2>
              {paymentError && (
                <div className="error-message">
                  {paymentError}
                </div>
              )}
              <div className="cart-items">
                {cart.length > 0 ? (
                  <>
                    {cart.map(item => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onRemove={handleRemoveFromCart}
                        onUpdateQuantity={updateCartItemQuantity}
                      />
                    ))}
                    <div className="cart-summary">
                      <h3>Total: ${totalCartAmount.toLocaleString('es-CL')}</h3>
                      <button
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? 'Procesando...' : 'Realizar pago'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="empty-message">Tu carrito está vacío</p>
                )}
              </div>
            </div>
          )}

          {showCreateProductForm && (
            <CreateProduct
              onSubmit={handleAddProduct}
              onClose={() => setShowCreateProductForm(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;