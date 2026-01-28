import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ToastProps } from '@shared/types/components.types';
import './Toast.scss';

export const Toast = ({ message, onClose, duration = 5000 }: ToastProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <aside
      className="toast"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="toast__message">{message}</span>
      <button
        ref={closeButtonRef}
        className="toast__close"
        onClick={onClose}
        aria-label="Fechar notificação"
        type="button"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
};
