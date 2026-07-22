import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './toastContextObject';

const DEFAULT_DURATION_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = 'success', duration = DEFAULT_DURATION_MS } = {}) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const success = useCallback((message) => show(message, { type: 'success' }), [show]);
  const error = useCallback((message) => show(message, { type: 'error' }), [show]);

  const value = { show, success, error, dismiss, toasts };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
