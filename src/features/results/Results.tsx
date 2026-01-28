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
        : 'Falha ao carregar mais repositórios. Verifique sua conexão.';
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
    if (!starsSort) return allRepos;

    const repos: GitHubRepository[] = [...allRepos];
    repos.sort((a, b) => {
      const comparison = a.stargazers_count - b.stargazers_count;
      return starsSort === 'stars-asc' ? comparison : -comparison;
    });

    return repos;
  }, [allRepos, starsSort]);

  const handleSortChange = useCallback(async (newNameSort: SortOption, newStarsSort: SortOption) => {
    setStarsSort(newStarsSort);

    const nameSortChanged = newNameSort !== nameSort;
    setNameSort(newNameSort);

    if (nameSortChanged && username) {
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
          : 'Falha ao carregar repositórios. Verifique sua conexão.';
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
        console.error('Falha ao buscar dados do usuário:', err);
      }
    };

    fetchData();
  }, [username, navigate, data, loading, search]);

  if (!username) {
    return null;
  }

  if (loading) {
    return (
      <main className="results-page" id="main-content" aria-busy="true">
        <div className="results-page__loading" role="status" aria-live="polite">
          Carregando...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="results-page" id="main-content">
        <div className="results-page__error" role="alert">
          {error}
          <button onClick={() => navigate('/')}>Voltar para Busca</button>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="results-page" id="main-content">
      <h1 className="visually-hidden">Perfil de {data.user.login} no GitHub</h1>

      {paginationError && (
        <Toast
          message={paginationError}
          onClose={() => setPaginationError(null)}
        />
      )}

      <nav aria-label="Navegação">
        <button className="results-page__back" onClick={() => navigate('/')}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Voltar para Busca</span>
        </button>
      </nav>

      <UserInfoCard user={data.user} totalStars={data.totalStars} />

      <section className="results-page__repositories" aria-labelledby="repos-title">
        <header className="results-page__repo-header">
          <h2 id="repos-title" className="results-page__repo-title">
            Repositórios ({data.user.public_repos})
          </h2>
          <RepositorySortControls onSortChange={handleSortChange} />
        </header>

        <div
          ref={scrollContainerRef}
          className="results-page__repo-scroll"
          onScroll={handleScroll}
          role="region"
          aria-label="Lista de repositórios"
          tabIndex={0}
        >
          <ul className="results-page__repo-list" role="list">
            {sortedRepos.map((repo) => (
              <li key={repo.id}>
                <RepositoryCard repository={repo} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div ref={loaderRef} className="results-page__loader" aria-hidden={!loadingMore}>
              {loadingMore && (
                <div role="status" aria-live="polite">
                  <Loader2 className="results-page__spinner" size={24} aria-hidden="true" />
                  <span>Carregando mais repositórios...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
