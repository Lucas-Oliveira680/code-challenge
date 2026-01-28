import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './OfflineBanner.scss';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      className="offline-banner"
      role="status"
      aria-live="polite"
      aria-label="Aviso de conexão"
    >
      <WifiOff size={16} aria-hidden="true" />
      <span>Conexão perdida. Buscando no cache offline.</span>
    </aside>
  );
};
