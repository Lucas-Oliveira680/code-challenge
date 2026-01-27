import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGitHubSearch } from '@shared/hooks/useGitHubSearch';
import { fetchGitHubRepos, isGitHubAPIError, type RepoSortField, type SortDirection } from '@shared/services/github.service';
import { Toast } from '@shared/components/Toast/Toast';
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
  const [allRepos, setAllRepos] = useState<GitHubRepository[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const [apiSort, setApiSort] = useState<RepoSortField>('updated');
  const [apiDirection, setApiDirection] = useState<SortDirection>('desc');
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const username = searchParams.get('username');

  // Sync initial repos when data loads
  useEffect(() => {
    if (data?.repositories) {
      setAllRepos(data.repositories);
      setHasMore(data.hasMoreRepos);
      setPage(1);
    }
  }, [data]);

  const loadMoreRepos = useCallback(async () => {
    if (!username || loadingMore || !hasMore || paginationError) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchGitHubRepos(username, {
        page: nextPage,
        perPage: 10,
        sort: apiSort,
        direction: apiDirection
      });
      setAllRepos(prev => [...prev, ...result.repositories]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      const errorMessage = isGitHubAPIError(err)
        ? err.message
        : 'Failed to load more repositories. Check your connection.';
      setPaginationError(errorMessage);
    } finally {
      setLoadingMore(false);
    }
  }, [username, page, loadingMore, hasMore, paginationError, apiSort, apiDirection]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMore && !loadingMore) {
      loadMoreRepos();
    }
  }, [hasMore, loadingMore, loadMoreRepos]);

  const sortedRepos = useMemo(() => {
    if (!allRepos.length) return [];

    // Name sorting is handled by API, only apply stars sorting client-side
    if (!starsSort) return allRepos;

    const repos: GitHubRepository[] = [...allRepos];
    repos.sort((a, b) => {
      const comparison = a.stargazers_count - b.stargazers_count;
      return starsSort === 'stars-asc' ? comparison : -comparison;
    });

    return repos;
  }, [allRepos, starsSort]);

  const handleSortChange = useCallback(async (newNameSort: SortOption, newStarsSort: SortOption) => {
    // Handle stars sort (client-side only)
    setStarsSort(newStarsSort);

    // Handle name sort (API-based)
    const nameSortChanged = newNameSort !== nameSort;
    setNameSort(newNameSort);

    if (nameSortChanged && username) {
      // Determine API sort parameters
      let newApiSort: RepoSortField = 'updated';
      let newApiDirection: SortDirection = 'desc';

      if (newNameSort === 'name-asc') {
        newApiSort = 'full_name';
        newApiDirection = 'asc';
      } else if (newNameSort === 'name-desc') {
        newApiSort = 'full_name';
        newApiDirection = 'desc';
      }

      setApiSort(newApiSort);
      setApiDirection(newApiDirection);

      // Reset and refetch
      setLoadingMore(true);
      setPaginationError(null);
      try {
        const result = await fetchGitHubRepos(username, {
          page: 1,
          perPage: 10,
          sort: newApiSort,
          direction: newApiDirection
        });
        setAllRepos(result.repositories);
        setHasMore(result.hasMore);
        setPage(1);
      } catch (err) {
        const errorMessage = isGitHubAPIError(err)
          ? err.message
          : 'Failed to load repositories. Check your connection.';
        setPaginationError(errorMessage);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [username, nameSort]);

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
      {paginationError && (
        <Toast
          message={paginationError}
          onClose={() => setPaginationError(null)}
        />
      )}

      <button className="results-page__back" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        <span>Back to Search</span>
      </button>

      <UserInfoCard user={data.user} totalStars={data.totalStars} />

      <section className="results-page__repositories">
        <div className="results-page__repo-header">
          <h2 className="results-page__repo-title">
            Repositories ({data.user.public_repos})
          </h2>
          <RepositorySortControls onSortChange={handleSortChange} />
        </div>

        <div ref={scrollContainerRef} className="results-page__repo-scroll" onScroll={handleScroll}>
          <div className="results-page__repo-list">
            {sortedRepos.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>

          {hasMore && (
            <div ref={loaderRef} className="results-page__loader">
              {loadingMore && (
                <>
                  <Loader2 className="results-page__spinner" size={24} />
                  <span>Loading more repositories...</span>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};