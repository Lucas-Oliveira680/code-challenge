import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { RepositoryCardProps } from '@features/results/types/results.types';
import './RepositoryCard.scss';

export const RepositoryCard = ({ repository }: RepositoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/repository?owner=${repository.owner.login}&repo=${repository.name}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className="repo-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes de ${repository.name}${repository.stargazers_count > 0 ? `, ${repository.stargazers_count} estrelas` : ''}`}
    >
      <header className="repo-card__header">
        <h3 className="repo-card__name">{repository.name}</h3>
        <div className="repo-card__stars" aria-label={`${repository.stargazers_count} estrelas`}>
          <Star size={14} aria-hidden="true" />
          <span aria-hidden="true">{repository.stargazers_count}</span>
        </div>
      </header>

      {repository.description && (
        <p className="repo-card__description">{repository.description}</p>
      )}

      <footer className="repo-card__footer">
        {repository.language && (
          <span className="repo-card__language" aria-label={`Linguagem: ${repository.language}`}>
            {repository.language}
          </span>
        )}
      </footer>
    </article>
  );
};
