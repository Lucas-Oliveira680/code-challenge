import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './OfflineBanner.scss';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      <WifiOff size={16} />
      <span>Conexão perdida. Buscando no cache offline.</span>
    </div>
  );
};
