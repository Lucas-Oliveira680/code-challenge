import { MapPin, Users, Star } from 'lucide-react';
import type { GitHubUserDetails } from '../../../../shared/types/github.types';
import './UserInfoCard.scss';

interface UserInfoCardProps {
  user: GitHubUserDetails;
}

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
    <article className="user-info-card">
      <div className="user-info-card__header">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="user-info-card__avatar"
        />
        <div className="user-info-card__main">
          <h1 className="user-info-card__name">{user.name || user.login}</h1>
          <a
            href={`https://github.com/${user.login}`}
            className="user-info-card__username"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{user.login}
          </a>
          {user.bio && <p className="user-info-card__bio">{user.bio}</p>}
        </div>
      </div>

      <div className="user-info-card__stats">
        <div className="user-info-card__stat">
          <Users size={16} />
          <span>{user.followers} Followers</span>
        </div>
        <div className="user-info-card__stat">
          <Users size={16} />
          <span>{user.following} Following</span>
        </div>
        <div className="user-info-card__stat">
          <Star size={16} />
          <span>{user.public_repos} Repositories</span>
        </div>
        {user.location && (
          <div className="user-info-card__stat">
            <MapPin size={16} />
            <span>{user.location}</span>
          </div>
        )}
      </div>
    </article>
  );
};

