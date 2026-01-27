import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ToastProps } from '@shared/types/components.types';
import './Toast.scss';

export const Toast = ({ message, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast">
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
};
