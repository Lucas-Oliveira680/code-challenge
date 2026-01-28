import { Users, Star } from 'lucide-react';
import type { UserCardProps } from '@features/search/types/search.types';
import './UserCard.scss';

export const UserCard = ({ user, onClick }: UserCardProps) => {
  return (
    <article className="user-card" onClick={onClick}>
      <div className="user-card__header">
        <img
          src={user.avatar_url}
          alt={`Avatar de ${user.login}`}
          className="user-card__avatar"
        />
        <div className="user-card__info">
          <h3 className="user-card__name">{user.login}</h3>
          <p className="user-card__username">@{user.login}</p>
        </div>
      </div>

      <div className="user-card__footer">
        <div className="user-card__stat">
          <Star size={14} />
          <span>Pontuação: {user.score.toFixed(1)}</span>
        </div>
        <div className="user-card__stat">
          <Users size={14} />
          <span>{user.type}</span>
        </div>
      </div>
    </article>
  );
};