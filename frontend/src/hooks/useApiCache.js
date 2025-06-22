import { useState, useEffect, useRef } from "react";

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApiCache = (key, fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const result = await fetcher(abortControllerRef.current.signal);

        // Cache the result
        cache.set(key, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
          console.error(`API Error for ${key}:`, err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [key, ...dependencies]);

  const invalidateCache = () => {
    cache.delete(key);
  };

  return { data, loading, error, invalidateCache };
};
