import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useEmails = (params = {}) => {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/emails', { params });
      setEmails(res.data.emails);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStar = async (id) => {
    await api.patch(`/api/emails/${id}/star`);
    setEmails((prev) => prev.map((e) => e._id === id ? { ...e, starred: !e.starred } : e));
  };

  const toggleArchive = async (id) => {
    await api.patch(`/api/emails/${id}/archive`);
    setEmails((prev) => prev.filter((e) => e._id !== id));
  };

  const toggleDelete = async (id) => {
    await api.patch(`/api/emails/${id}/delete`);
    setEmails((prev) => prev.filter((e) => e._id !== id));
  };

  return { emails, pagination, loading, error, refetch: fetch, toggleStar, toggleArchive, toggleDelete };
};
