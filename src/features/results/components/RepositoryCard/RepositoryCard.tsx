import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { RepositoryCardProps } from '@features/results/types/results.types';
import './RepositoryCard.scss';

export const RepositoryCard = ({ repository }: RepositoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/repository?owner=${repository.owner.login}&repo=${repository.name}`);
  };

  return (
    <article className="repo-card" onClick={handleClick}>
      <div className="repo-card__header">
        <h3 className="repo-card__name">{repository.name}</h3>
        <div className="repo-card__stars">
          <Star size={14} />
          <span>{repository.stargazers_count}</span>
        </div>
      </div>

      {repository.description && (
        <p className="repo-card__description">{repository.description}</p>
      )}

      <div className="repo-card__footer">
        {repository.language && (
          <span className="repo-card__language">{repository.language}</span>
        )}
      </div>
    </article>
  );
};
