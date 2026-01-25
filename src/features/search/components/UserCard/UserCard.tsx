import { Users, Star } from 'lucide-react';
import type { GitHubUserSearchItem } from '../../../../shared/types/github.types';
import './UserCard.scss';

interface UserCardProps {
  user: GitHubUserSearchItem;
  onClick?: () => void;
}

export const UserCard = ({ user, onClick }: UserCardProps) => {
  return (
    <article className="user-card" onClick={onClick}>
      <div className="user-card__header">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
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
          <span>Score: {user.score.toFixed(1)}</span>
        </div>
        <div className="user-card__stat">
          <Users size={14} />
          <span>{user.type}</span>
        </div>
      </div>
    </article>
  );
};