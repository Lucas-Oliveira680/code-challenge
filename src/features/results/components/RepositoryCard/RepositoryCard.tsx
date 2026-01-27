import { Star, ExternalLink } from 'lucide-react';
import type { RepositoryCardProps } from '@features/results/types/results.types';
import './RepositoryCard.scss';

export const RepositoryCard = ({ repository }: RepositoryCardProps) => {
  return (
    <article className="repo-card">
      <div className="repo-card__header">
        <h3 className="repo-card__name">
          <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
            {repository.name}
            <ExternalLink size={14} />
          </a>
        </h3>
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
