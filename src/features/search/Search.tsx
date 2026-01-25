import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from "./components/Searchbar/Searchbar";
import { UserSuggestions } from "./components/UserSuggestions/UserSuggestions";
import { RecentSearches } from "./components/RecentSearches/RecentSearches";
import { searchGitHubUsers } from '../../shared/services/github.service';
import { getRecentUsers } from '../../shared/services/cache.service';
import { Toast } from '../../shared/components/Toast/Toast';
import type { GitHubUserSearchItem } from '../../shared/types/github.types';
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
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
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

    return (
        <div style={{ padding: '2rem' }} className="search-page">
            <SearchBar
                onSearch={handleSearch}
                onValidationError={() => setHasValidationError(true)}
                isLoading={loading}
                isExpanded={hasSearched}
            />

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
        </div>
    );
}