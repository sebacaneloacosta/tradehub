import React, { useState, useEffect } from 'react';
import { getItems, createItem, deleteItem } from '../api';

function ItemList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await createItem(newItem);
      setNewItem({ name: '', description: '' });
      fetchItems();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div>
      <h2>Items</h2>
      <div>
        <input
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder="Name"
        />
        <input
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          placeholder="Description"
        />
        <button onClick={handleCreate}>Add Item</button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;