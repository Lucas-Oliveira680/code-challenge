import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGitHubSearch } from '@shared/hooks/useGitHubSearch';
import { fetchGitHubRepos, isGitHubAPIError, type RepoSortField, type SortDirection } from '@shared/services/github.service';
import { updateCachedUserRepos } from '@shared/services/cache.service';
import { Toast } from '@shared/components/Toast/Toast';
import { UserInfoCard } from './components/UserInfoCard/UserInfoCard';
import { RepositoryCard } from './components/RepositoryCard/RepositoryCard';
import { RepositorySortControls } from './components/RepositorySortControls/RepositorySortControls';
import type { SortOption } from '@features/results/types/results.types';
import type { GitHubRepository } from '@shared/types/github.types';
import './Results.scss';

const PAGE_SIZE = 10;
const INITIAL_PAGE = 1;
const SCROLL_THRESHOLD = 100;

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
  const isLoadingMoreRef = useRef(false);
  const isFetchingRef = useRef(false);

  const username = searchParams.get('username');

  useEffect(() => {
    if (data?.repositories) {
      setAllRepos(data.repositories);
      setHasMore(data.hasMoreRepos);
      setPage(INITIAL_PAGE);
    }
  }, [data]);

  const loadMoreRepos = useCallback(async () => {
    if (!username || isLoadingMoreRef.current || !hasMore || paginationError) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchGitHubRepos(username, {
        page: nextPage,
        perPage: PAGE_SIZE,
        sort: apiSort,
        direction: apiDirection
      });
      const newAllRepos = [...allRepos, ...result.repositories];
      setAllRepos(newAllRepos);
      setHasMore(result.hasMore);
      setPage(nextPage);
      updateCachedUserRepos(username, newAllRepos, result.hasMore);
    } catch (err) {
      const errorMessage = isGitHubAPIError(err)
        ? err.message
        : 'Falha ao carregar mais repositórios. Verifique sua conexão.';
      setPaginationError(errorMessage);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [username, page, hasMore, paginationError, apiSort, apiDirection, allRepos]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMoreRepos();
        }
      },
      {
        root: null,
        rootMargin: `${SCROLL_THRESHOLD}px`,
        threshold: 0,
      }
    );

    observer.observe(loader);

    return () => {
      observer.disconnect();
    };
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
          page: INITIAL_PAGE,
          perPage: PAGE_SIZE,
          sort: newApiSort,
          direction: newApiDirection
        });
        setAllRepos(result.repositories);
        setHasMore(result.hasMore);
        setPage(INITIAL_PAGE);
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

    if (isFetchingRef.current || loading || (data && data.username === username)) {
      return;
    }

    const fetchData = async () => {
      isFetchingRef.current = true;
      try {
        await search(username);
      } catch (err) {
        console.error('Falha ao buscar dados do usuário:', err);
      } finally {
        isFetchingRef.current = false;
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
          className="results-page__repo-scroll"
          role="region"
          aria-label="Lista de repositórios"
          tabIndex={0}
        >
          <ul className="results-page__repo-list" role="list">
            {sortedRepos.map((repo, index) => (
              <li key={`${repo.id}-${index}`}>
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
