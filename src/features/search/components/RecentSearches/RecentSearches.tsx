import type { RecentSearchesProps } from '@features/search/types/search.types';
import './RecentSearches.scss';

export const RecentSearches = ({ users, onSelect }: RecentSearchesProps) => {
  if (users.length === 0) return null;

  return (
    <section className="recent-searches" aria-labelledby="recent-searches-title">
      <h2 id="recent-searches-title" className="recent-searches__title">Buscas Recentes</h2>
      <ul className="recent-searches__grid" role="list">
        {users.map((result) => (
          <li key={result.username}>
            <button
              className="recent-searches__card"
              onClick={() => onSelect(result.username)}
              aria-label={`Ver perfil de ${result.user.login}${result.user.name ? `, ${result.user.name}` : ''}`}
            >
              <img
                src={result.user.avatar_url}
                alt=""
                aria-hidden="true"
                className="recent-searches__avatar"
              />
              <div className="recent-searches__info">
                <span className="recent-searches__name">{result.user.login}</span>
                {result.user.name && (
                  <span className="recent-searches__fullname">{result.user.name}</span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
