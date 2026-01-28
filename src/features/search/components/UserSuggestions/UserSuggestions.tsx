import type { UserSuggestionsProps } from '@features/search/types/search.types';
import './UserSuggestions.scss';

export const UserSuggestions = ({ users, onSelect, hasSearched, hasError }: UserSuggestionsProps) => {
  if (!hasSearched || hasError) return null;

  if (users.length === 0) {
    return (
      <div className="user-suggestions user-suggestions--empty">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <ul className="user-suggestions">
      {users.map((user) => (
        <li key={user.id} className="user-suggestions__item">
          <button
            className="user-suggestions__button"
            onClick={() => onSelect(user.login)}
          >
            <img
              src={user.avatar_url}
              alt={`Avatar de ${user.login}`}
              className="user-suggestions__avatar"
            />
            <span className="user-suggestions__name">{user.login}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};
