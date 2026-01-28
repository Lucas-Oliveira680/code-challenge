import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { SortOption, RepositorySortControlsProps } from '@features/results/types/results.types';
import './RepositorySortControls.scss';

export const RepositorySortControls = ({ onSortChange }: RepositorySortControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nameSort, setNameSort] = useState<SortOption>(null);
  const [starsSort, setStarsSort] = useState<SortOption>(null);
  const [appliedNameSort, setAppliedNameSort] = useState<SortOption>(null);
  const [appliedStarsSort, setAppliedStarsSort] = useState<SortOption>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleNameSortClick = (value: SortOption) => {
    setNameSort(nameSort === value ? null : value);
  };

  const handleStarsSortClick = (value: SortOption) => {
    setStarsSort(starsSort === value ? null : value);
  };

  const handleApply = () => {
    setAppliedNameSort(nameSort);
    setAppliedStarsSort(starsSort);
    onSortChange(nameSort, starsSort);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = () => {
    setNameSort(null);
    setStarsSort(null);
    setAppliedNameSort(null);
    setAppliedStarsSort(null);
    onSortChange(null, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasActiveFilters = appliedNameSort !== null || appliedStarsSort !== null;
  const hasChanges = nameSort !== appliedNameSort || starsSort !== appliedStarsSort;

  return (
    <div className="repo-sort-controls" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        className={`repo-sort-controls__trigger ${hasActiveFilters ? 'repo-sort-controls__trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Ordenar repositórios${hasActiveFilters ? ' (filtros ativos)' : ''}`}
        type="button"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>Ordenar</span>
        {hasActiveFilters && <span className="repo-sort-controls__badge" aria-hidden="true"></span>}
      </button>

      {isOpen && (
        <div
          className="repo-sort-controls__dropdown"
          role="dialog"
          aria-label="Opções de ordenação"
        >
          <fieldset className="repo-sort-controls__section">
            <legend className="repo-sort-controls__label">Ordenar por Nome</legend>
            <div className="repo-sort-controls__options" role="group">
              <button
                className={`repo-sort-controls__option ${nameSort === 'name-asc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleNameSortClick('name-asc')}
                aria-pressed={nameSort === 'name-asc'}
                type="button"
              >
                A → Z
              </button>
              <button
                className={`repo-sort-controls__option ${nameSort === 'name-desc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleNameSortClick('name-desc')}
                aria-pressed={nameSort === 'name-desc'}
                type="button"
              >
                Z → A
              </button>
            </div>
          </fieldset>

          <fieldset className="repo-sort-controls__section">
            <legend className="repo-sort-controls__label">Ordenar por Estrelas</legend>
            <div className="repo-sort-controls__options" role="group">
              <button
                className={`repo-sort-controls__option ${starsSort === 'stars-asc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleStarsSortClick('stars-asc')}
                aria-pressed={starsSort === 'stars-asc'}
                type="button"
              >
                Menor → Maior
              </button>
              <button
                className={`repo-sort-controls__option ${starsSort === 'stars-desc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleStarsSortClick('stars-desc')}
                aria-pressed={starsSort === 'stars-desc'}
                type="button"
              >
                Maior → Menor
              </button>
            </div>
          </fieldset>

          <div className="repo-sort-controls__actions">
            <button
              className="repo-sort-controls__clear-btn"
              onClick={handleClear}
              type="button"
            >
              Limpar
            </button>
            <button
              className="repo-sort-controls__apply-btn"
              onClick={handleApply}
              disabled={!hasChanges}
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
