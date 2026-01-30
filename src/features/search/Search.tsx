import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from "./components/Searchbar/Searchbar";
import { UserSuggestions } from "./components/UserSuggestions/UserSuggestions";
import { RecentSearches } from "./components/RecentSearches/RecentSearches";
import { searchGitHubUsers } from '@shared/services/github.service';
import { getRecentUsers } from '@shared/services/cache.service';
import { Toast } from '@shared/components/Toast/Toast';
import type { GitHubUserSearchItem } from '@shared/types/github.types';
import "./Search.scss"

export const Search = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<GitHubUserSearchItem[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [hasValidationError, setHasValidationError] = useState(false);

    const handleSearch = async (query: string) => {
        setHasValidationError(false);
        setToastMessage(null);
        setLoading(true);
        try {
            const result = await searchGitHubUsers(query, 5);
            setSuggestions(result.users);
            setHasSearched(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado';
            setToastMessage(message);
            setSuggestions([]);
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (username: string) => {
        navigate(`/results?username=${encodeURIComponent(username)}`);
    };

    const getStatusMessage = () => {
        if (loading) return 'Buscando usuários...';
        if (hasSearched && suggestions.length === 0) return 'Nenhum usuário encontrado';
        if (hasSearched && suggestions.length > 0) return `${suggestions.length} usuários encontrados`;
        return '';
    };

    return (
        <main className="search-page" id="main-content">
            <header className="search-page__header">
                <h1 className="search-page__title">GitHub Explorer</h1>
                <p className="search-page__description">
                    Encontre usuários e explore seus repositórios
                </p>
            </header>

            <SearchBar
                onSearch={handleSearch}
                onValidationError={() => setHasValidationError(true)}
                isLoading={loading}
                isExpanded={hasSearched}
            />

            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="visually-hidden"
            >
                {getStatusMessage()}
            </div>

            <UserSuggestions
                users={suggestions}
                onSelect={handleSelectUser}
                hasSearched={hasSearched}
                hasError={!!toastMessage || hasValidationError}
            />

            {!hasSearched && (
                <RecentSearches
                    users={getRecentUsers()}
                    onSelect={handleSelectUser}
                />
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </main>
    );
}
