import type { UserSuggestionsProps } from '@features/search/types/search.types';
import './UserSuggestions.scss';

export const UserSuggestions = ({ users, onSelect, hasSearched, hasError }: UserSuggestionsProps) => {
  if (!hasSearched || hasError) return null;

  if (users.length === 0) {
    return (
      <p className="user-suggestions user-suggestions--empty" role="status">
        Nenhum usuário encontrado
      </p>
    );
  }

  return (
    <nav aria-label="Sugestões de usuários">
      <ul className="user-suggestions" role="listbox" aria-label="Selecione um usuário">
        {users.map((user) => (
          <li key={user.id} className="user-suggestions__item" role="option">
            <button
              className="user-suggestions__button"
              onClick={() => onSelect(user.login)}
              aria-label={`Ver perfil de ${user.login}`}
            >
              <img
                src={user.avatar_url}
                alt=""
                aria-hidden="true"
                className="user-suggestions__avatar"
              />
              <span className="user-suggestions__name">{user.login}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
