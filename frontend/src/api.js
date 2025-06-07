import axios from 'axios';

// 1. Configuración base
const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor para actualizar el token dinámicamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Manejo centralizado de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si el token es inválido
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. Funciones específicas para TradeHub
export const getProducts = () => api.get('products/');
export const createProduct = (product) => api.post('products/', product);
export const updateProduct = (id, product) => api.patch(`products/${id}/`, product);
export const deleteProduct = (id) => api.delete(`products/${id}/`);

// 5. Operación especial para stock
export const reduceStock = (id, quantity) => 
  api.post(`products/${id}/reduce_stock/`, { quantity });

export default api;

export const createOrder = (orderData) => api.post('orders/', orderData);