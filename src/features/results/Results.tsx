import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGitHubSearch } from '@shared/hooks/useGitHubSearch';
import { UserInfoCard } from './components/UserInfoCard/UserInfoCard';
import { RepositoryCard } from './components/RepositoryCard/RepositoryCard';
import { RepositorySortControls } from './components/RepositorySortControls/RepositorySortControls';
import type { SortOption } from '@features/results/types/results.types';
import type { GitHubRepository } from '@shared/types/github.types';
import './Results.scss';

export const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { search, loading, error, data } = useGitHubSearch();
  const [nameSort, setNameSort] = useState<SortOption>(null);
  const [starsSort, setStarsSort] = useState<SortOption>(null);

  const username = searchParams.get('username');

  const sortedRepos = useMemo(() => {
    if (!data?.repositories) return [];

    const repos: GitHubRepository[] = [...data.repositories];

    if (nameSort) {
      repos.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return nameSort === 'name-asc' ? comparison : -comparison;
      });
    }

    if (starsSort) {
      repos.sort((a, b) => {
        const comparison = a.stargazers_count - b.stargazers_count;
        return starsSort === 'stars-asc' ? comparison : -comparison;
      });
    }

    return repos;
  }, [data, nameSort, starsSort]);

  const handleSortChange = (newNameSort: SortOption, newStarsSort: SortOption) => {
    setNameSort(newNameSort);
    setStarsSort(newStarsSort);
  };

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    if (loading || (data && data.username === username)) {
      return;
    }

    const fetchData = async () => {
      try {
        await search(username);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchData();
  }, [username, navigate, data, loading, search]);

  if (!username) {
    return null;
  }

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-page__loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <div className="results-page__error">
          {error}
          <button onClick={() => navigate('/')}>Back to Search</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="results-page">
      <button className="results-page__back" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        <span>Back to Search</span>
      </button>

      <UserInfoCard user={data.user} totalStars={data.totalStars} />

      <section className="results-page__repositories">
        <div className="results-page__repo-header">
          <h2 className="results-page__repo-title">
            Repositories ({sortedRepos.length})
          </h2>
          <RepositorySortControls onSortChange={handleSortChange} />
        </div>

        <div className="results-page__repo-list">
          {sortedRepos.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      </section>
    </div>
  );
};