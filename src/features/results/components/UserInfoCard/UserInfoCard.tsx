import { MapPin, Users, Star } from 'lucide-react';
import type { UserInfoCardProps } from '@features/results/types/results.types';
import './UserInfoCard.scss';

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
    <article className="user-info-card" aria-label={`Informações de ${user.name || user.login}`}>
      <header className="user-info-card__header">
        <img
          src={user.avatar_url}
          alt={`Foto de perfil de ${user.login}`}
          className="user-info-card__avatar"
        />
        <div className="user-info-card__main">
          <h2 className="user-info-card__name">{user.name || user.login}</h2>
          <a
            href={`https://github.com/${user.login}`}
            className="user-info-card__username"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visitar perfil de ${user.login} no GitHub (abre em nova aba)`}
          >
            @{user.login}
          </a>
          {user.bio && <p className="user-info-card__bio">{user.bio}</p>}
        </div>
      </header>

      <dl className="user-info-card__stats">
        <div className="user-info-card__stat">
          <Users size={16} aria-hidden="true" />
          <dt className="visually-hidden">Seguidores</dt>
          <dd><span className="user-info-card__stat-value">{user.followers}</span> Seguidores</dd>
        </div>
        <div className="user-info-card__stat">
          <Users size={16} aria-hidden="true" />
          <dt className="visually-hidden">Seguindo</dt>
          <dd><span className="user-info-card__stat-value">{user.following}</span> Seguindo</dd>
        </div>
        <div className="user-info-card__stat">
          <Star size={16} aria-hidden="true" />
          <dt className="visually-hidden">Repositórios</dt>
          <dd><span className="user-info-card__stat-value">{user.public_repos}</span> Repositórios</dd>
        </div>
        {user.location && (
          <div className="user-info-card__stat">
            <MapPin size={16} aria-hidden="true" />
            <dt className="visually-hidden">Localização</dt>
            <dd>{user.location}</dd>
          </div>
        )}
      </dl>
    </article>
  );
};

