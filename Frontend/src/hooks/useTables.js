// hooks/useTables.js
import { useState, useCallback } from 'react';
import { tableService } from '../services/tableService';

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tableService.getAllTables(params);
      if (response.success && response.data) {
        setTables(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableTables = useCallback(async (partySize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tableService.getAvailableTables(partySize);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (err) {
      setError(err.message || 'Failed to fetch available tables');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tables,
    loading,
    error,
    fetchTables,
    getAvailableTables,
    createTable: tableService.createTable,
    updateTable: tableService.updateTable,
    updateStatus: tableService.updateStatus,
  };
};