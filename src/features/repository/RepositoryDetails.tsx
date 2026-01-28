import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, GitFork, Eye, ExternalLink, Calendar, Code } from 'lucide-react';
import { fetchRepositoryDetails, isGitHubAPIError } from '@shared/services/github.service';
import type { GitHubRepositoryDetails } from '@shared/types/github.types';
import './RepositoryDetails.scss';

export const RepositoryDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState<GitHubRepositoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      try {
        const data = await fetchRepositoryDetails(owner, repo);
        setRepository(data);
      } catch (err) {
        const errorMessage = isGitHubAPIError(err)
          ? err.message
          : 'Falha ao carregar detalhes do repositório';
        setError(errorMessage);
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
      <div className="repo-details">
        <div className="repo-details__loading">Carregando detalhes do repositório...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repo-details">
        <div className="repo-details__error">
          {error}
          <button onClick={handleBack}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  return (
    <div className="repo-details">
      <button className="repo-details__back" onClick={handleBack}>
        <ArrowLeft size={18} />
        <span>Voltar</span>
      </button>

      <header className="repo-details__header">
        <div className="repo-details__title-row">
          <h1 className="repo-details__name">{repository.name}</h1>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-details__external-link"
          >
            <ExternalLink size={18} />
            Ver no GitHub
          </a>
        </div>

        {repository.description && (
          <p className="repo-details__description">{repository.description}</p>
        )}

        <div className="repo-details__stats">
          <div className="repo-details__stat">
            <Star size={16} />
            <span>{repository.stargazers_count.toLocaleString('pt-BR')}</span>
            <span className="repo-details__stat-label">estrelas</span>
          </div>
          <div className="repo-details__stat">
            <GitFork size={16} />
            <span>{repository.forks_count.toLocaleString('pt-BR')}</span>
            <span className="repo-details__stat-label">forks</span>
          </div>
          <div className="repo-details__stat">
            <Eye size={16} />
            <span>{repository.watchers_count.toLocaleString('pt-BR')}</span>
            <span className="repo-details__stat-label">observadores</span>
          </div>
        </div>
      </header>

      <section className="repo-details__info">
        <h2 className="repo-details__section-title">Informações</h2>

        <div className="repo-details__info-grid">
          {repository.language && (
            <div className="repo-details__info-item">
              <Code size={16} />
              <span className="repo-details__info-label">Linguagem</span>
              <span className="repo-details__info-value">{repository.language}</span>
            </div>
          )}

          <div className="repo-details__info-item">
            <Calendar size={16} />
            <span className="repo-details__info-label">Criado em</span>
            <span className="repo-details__info-value">{formatDate(repository.created_at)}</span>
          </div>

          <div className="repo-details__info-item">
            <Calendar size={16} />
            <span className="repo-details__info-label">Última atualização</span>
            <span className="repo-details__info-value">{formatDate(repository.updated_at)}</span>
          </div>

          <div className="repo-details__info-item">
            <GitFork size={16} />
            <span className="repo-details__info-label">Branch padrão</span>
            <span className="repo-details__info-value">{repository.default_branch}</span>
          </div>
        </div>

        {repository.topics && repository.topics.length > 0 && (
          <div className="repo-details__topics">
            <span className="repo-details__info-label">Tópicos</span>
            <div className="repo-details__topics-list">
              {repository.topics.map((topic) => (
                <span key={topic} className="repo-details__topic">{topic}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {repository.homepage && (
        <section className="repo-details__links">
          <h2 className="repo-details__section-title">Links</h2>
          <a
            href={repository.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-details__homepage-link"
          >
            <ExternalLink size={14} />
            {repository.homepage}
          </a>
        </section>
      )}
    </div>
  );
};
