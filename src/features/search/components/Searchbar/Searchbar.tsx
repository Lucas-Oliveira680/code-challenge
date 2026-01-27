import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { validateSearchQuery } from '@shared/utils/validation';
import type { SearchbarProps } from '@features/search/types/search.types';
import './Searchbar.scss';

export const SearchBar = ({ onSearch, onValidationError, isLoading = false, isExpanded = false }: SearchbarProps) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid search query');
      onValidationError?.();
      return;
    }

    setError('');
    onSearch(query.trim());
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (error && value) {
      setError('');
    }
  };

  return (
    <div className="searchbar">
      <form onSubmit={handleSubmit} role="search">
        <div className={`searchbar__container ${isExpanded ? 'searchbar__container--expanded' : ''}`}>
          <Search className="searchbar__icon" size={20} />

          <input
            type="text"
            className="searchbar__input"
            placeholder="Search GitHub users (e.g., lucas, javascript developers)..."
            value={query}
            onChange={handleInputChange}
            disabled={isLoading}
            role="searchbox"
            aria-label="Search GitHub users"
            aria-invalid={!!error}
            aria-describedby={error ? 'search-error' : undefined}
          />

          <button
            type="submit"
            className="searchbar__submit-button"
            disabled={isLoading || !query.trim()}
            aria-label="Search"
          >
            {isLoading ? (
              <span className="searchbar__spinner" aria-hidden="true" />
            ) : (
              <ArrowRight size={20} />
            )}
          </button>
        </div>

        {error && (
          <div id="search-error" className="searchbar__error" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}