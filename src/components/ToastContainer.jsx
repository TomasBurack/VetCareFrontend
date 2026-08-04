import { useToast } from '../context/useToast';
import { useLanguage } from '../i18n/useLanguage';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  const { tApi } = useLanguage();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => dismiss(toast.id)}>
          {tApi(toast.message)}
        </div>
      ))}
    </div>
  );
}
