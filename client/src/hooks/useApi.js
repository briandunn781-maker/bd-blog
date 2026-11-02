import { useEffect, useState, useCallback } from 'react';
import api, { errorMessage } from '../api/client.js';

// GETs `path` whenever it changes. Pass null to skip.
export default function useApi(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: null });

  useEffect(() => {
    if (!path) return;
    let ignore = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path)
      .then((res) => !ignore && setState({ data: res.data, loading: false, error: null }))
      .catch((err) => !ignore && setState({ data: null, loading: false, error: errorMessage(err) }));
    return () => {
      ignore = true;
    };
  }, [path]);

  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  );

  return { ...state, setData };
}
