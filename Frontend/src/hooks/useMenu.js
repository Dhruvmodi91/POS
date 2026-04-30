// hooks/useMenu.js
import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all menu items
  const fetchMenuItems = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      const params = category ? { category } : undefined;
      const items = await menuService.getAll(params);
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get item by ID
  const getItemById = useCallback(async (id) => {
    try {
      return await menuService.getById(id);
    } catch (err) {
      console.error('Failed to fetch menu item:', err);
      return null;
    }
  }, []);

  // Create new item
  const createItem = useCallback(async (data) => {
    try {
      const newItem = await menuService.create(data);
      setMenuItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw err;
    }
  }, []);

  // Update item
  const updateItem = useCallback(async (id, data) => {
    try {
      const updatedItem = await menuService.update(id, data);
      setMenuItems(prev => prev.map(item => 
        item._id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      throw err;
    }
  }, []);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    try {
      await menuService.delete(id);
      setMenuItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchMenuItems
  };
};