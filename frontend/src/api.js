import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const getAuthToken = () => {
  return localStorage.getItem('firebaseToken');
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  }
});

export const getItems = () => api.get('items/');
export const createItem = (item) => api.post('items/', item);
export const updateItem = (id, item) => api.put(`items/${id}/`, item);
export const deleteItem = (id) => api.delete(`items/${id}/`);

export default api;