// hooks/useBills.js
import { useState, useCallback } from 'react';
import { billService } from '../services/billService';

export const useBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchBills = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await billService.getAllBills(params);
      if (response.success && response.data) {
        setBills(response.data.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBill = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await billService.createBill(data);
      if (response.success && response.data) {
        setBills(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to create bill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bills,
    loading,
    error,
    pagination,
    fetchBills,
    createBill,
    updateBill: billService.updateBill,
    deleteBill: billService.deleteBill,
  };
};