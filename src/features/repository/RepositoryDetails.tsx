import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, GitFork, Eye, ExternalLink, Calendar, Code } from 'lucide-react';
import { fetchRepositoryDetails, isGitHubAPIError } from '@shared/services/github.service';
import { getCachedRepoDetails, cacheRepoDetails } from '@shared/services/cache.service';
import type { GitHubRepositoryDetails } from '@shared/types/github.types';
import './RepositoryDetails.scss';

export const RepositoryDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState<GitHubRepositoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  useEffect(() => {
    if (!owner || !repo) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setFromCache(false);

      const cached = getCachedRepoDetails(owner, repo);

      try {
        const data = await fetchRepositoryDetails(owner, repo);
        setRepository(data);
        cacheRepoDetails(owner, repo, data);
      } catch (err) {
        if (cached) {
          setRepository(cached);
          setFromCache(true);
        } else {
          const errorMessage = isGitHubAPIError(err)
            ? err.message
            : 'Falha ao carregar detalhes do repositório';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, repo, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="repo-details" id="main-content" aria-busy="true">
        <div className="repo-details__loading" role="status" aria-live="polite">
          Carregando detalhes do repositório...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="repo-details" id="main-content">
        <nav aria-label="Navegação">
          <button className="repo-details__back" onClick={handleBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Voltar</span>
          </button>
        </nav>

        <div className="repo-details__error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (!repository) {
    return null;
  }

  return (
    <main className="repo-details" id="main-content">
      <nav aria-label="Navegação">
        <button className="repo-details__back" onClick={handleBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Voltar</span>
        </button>
      </nav>

      {fromCache && (
        <div className="repo-details__cache-notice" role="status">
          Exibindo dados do cache (offline)
        </div>
      )}

      <article>
        <header className="repo-details__header">
          <div className="repo-details__title-row">
            <h1 className="repo-details__name">{repository.name}</h1>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-details__external-link"
              aria-label={`Ver ${repository.name} no GitHub (abre em nova aba)`}
            >
              <ExternalLink size={18} aria-hidden="true" />
              Ver no GitHub
            </a>
          </div>

          {repository.description && (
            <p className="repo-details__description">{repository.description}</p>
          )}

          <dl className="repo-details__stats">
            <div className="repo-details__stat">
              <Star size={16} aria-hidden="true" />
              <dt className="visually-hidden">Estrelas</dt>
              <dd>
                <span>{repository.stargazers_count.toLocaleString('pt-BR')}</span>
                <span className="repo-details__stat-label">estrelas</span>
              </dd>
            </div>
            <div className="repo-details__stat">
              <GitFork size={16} aria-hidden="true" />
              <dt className="visually-hidden">Forks</dt>
              <dd>
                <span>{repository.forks_count.toLocaleString('pt-BR')}</span>
                <span className="repo-details__stat-label">forks</span>
              </dd>
            </div>
            <div className="repo-details__stat">
              <Eye size={16} aria-hidden="true" />
              <dt className="visually-hidden">Observadores</dt>
              <dd>
                <span>{repository.watchers_count.toLocaleString('pt-BR')}</span>
                <span className="repo-details__stat-label">observadores</span>
              </dd>
            </div>
          </dl>
        </header>

        <section className="repo-details__info" aria-labelledby="info-title">
          <h2 id="info-title" className="repo-details__section-title">Informações</h2>

          <dl className="repo-details__info-grid">
            {repository.language && (
              <div className="repo-details__info-item">
                <Code size={16} aria-hidden="true" />
                <dt className="repo-details__info-label">Linguagem</dt>
                <dd className="repo-details__info-value">{repository.language}</dd>
              </div>
            )}

            <div className="repo-details__info-item">
              <Calendar size={16} aria-hidden="true" />
              <dt className="repo-details__info-label">Criado em</dt>
              <dd className="repo-details__info-value">
                <time dateTime={repository.created_at}>{formatDate(repository.created_at)}</time>
              </dd>
            </div>

            <div className="repo-details__info-item">
              <Calendar size={16} aria-hidden="true" />
              <dt className="repo-details__info-label">Última atualização</dt>
              <dd className="repo-details__info-value">
                <time dateTime={repository.updated_at}>{formatDate(repository.updated_at)}</time>
              </dd>
            </div>

            <div className="repo-details__info-item">
              <GitFork size={16} aria-hidden="true" />
              <dt className="repo-details__info-label">Branch padrão</dt>
              <dd className="repo-details__info-value">{repository.default_branch}</dd>
            </div>
          </dl>

          {repository.topics && repository.topics.length > 0 && (
            <div className="repo-details__topics">
              <h3 className="repo-details__info-label" id="topics-label">Tópicos</h3>
              <ul className="repo-details__topics-list" aria-labelledby="topics-label" role="list">
                {repository.topics.map((topic) => (
                  <li key={topic} className="repo-details__topic">{topic}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {repository.homepage && (
          <section className="repo-details__links" aria-labelledby="links-title">
            <h2 id="links-title" className="repo-details__section-title">Links</h2>
            <a
              href={repository.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-details__homepage-link"
              aria-label={`Visitar página do projeto (abre em nova aba)`}
            >
              <ExternalLink size={14} aria-hidden="true" />
              {repository.homepage}
            </a>
          </section>
        )}
      </article>
    </main>
  );
};
