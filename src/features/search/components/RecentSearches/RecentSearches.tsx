import type { RecentSearchesProps } from '@features/search/types/search.types';
import './RecentSearches.scss';

export const RecentSearches = ({ users, onSelect }: RecentSearchesProps) => {
  if (users.length === 0) return null;

  return (
    <section className="recent-searches">
      <h2 className="recent-searches__title">Buscas Recentes</h2>
      <div className="recent-searches__grid">
        {users.map((result) => (
          <button
            key={result.username}
            className="recent-searches__card"
            onClick={() => onSelect(result.username)}
          >
            <img
              src={result.user.avatar_url}
              alt={`Avatar de ${result.user.login}`}
              className="recent-searches__avatar"
            />
            <div className="recent-searches__info">
              <span className="recent-searches__name">{result.user.login}</span>
              {result.user.name && (
                <span className="recent-searches__fullname">{result.user.name}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
