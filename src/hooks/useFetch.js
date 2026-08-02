import { useState, useEffect, useCallback } from 'react';

/**
 * Fetch-on-mount hook. Re-fetches when deps change.
 * Returns { data, loading, error, refetch }
 */
export function useFetch(apiFn, params, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (params !== undefined ? apiFn(params) : apiFn());
      setData(res.data?.data ?? res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
}
