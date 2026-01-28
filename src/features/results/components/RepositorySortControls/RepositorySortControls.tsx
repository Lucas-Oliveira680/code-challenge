import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { SortOption, RepositorySortControlsProps } from '@features/results/types/results.types';
import './RepositorySortControls.scss';

export const RepositorySortControls = ({ onSortChange }: RepositorySortControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nameSort, setNameSort] = useState<SortOption>(null);
  const [starsSort, setStarsSort] = useState<SortOption>(null);
  const [appliedNameSort, setAppliedNameSort] = useState<SortOption>(null);
  const [appliedStarsSort, setAppliedStarsSort] = useState<SortOption>(null);

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
  };

  const handleClear = () => {
    setNameSort(null);
    setStarsSort(null);
    setAppliedNameSort(null);
    setAppliedStarsSort(null);
    onSortChange(null, null);
  };

  const hasActiveFilters = appliedNameSort !== null || appliedStarsSort !== null;
  const hasChanges = nameSort !== appliedNameSort || starsSort !== appliedStarsSort;

  return (
    <div className="repo-sort-controls">
      <button
        className={`repo-sort-controls__trigger ${hasActiveFilters ? 'repo-sort-controls__trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlidersHorizontal size={16} />
        <span>Ordenar</span>
        {hasActiveFilters && <span className="repo-sort-controls__badge"></span>}
      </button>

      {isOpen && (
        <div className="repo-sort-controls__dropdown">
          <div className="repo-sort-controls__section">
            <span className="repo-sort-controls__label">Ordenar por Nome</span>
            <div className="repo-sort-controls__options">
              <button
                className={`repo-sort-controls__option ${nameSort === 'name-asc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleNameSortClick('name-asc')}
              >
                A → Z
              </button>
              <button
                className={`repo-sort-controls__option ${nameSort === 'name-desc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleNameSortClick('name-desc')}
              >
                Z → A
              </button>
            </div>
          </div>

          <div className="repo-sort-controls__section">
            <span className="repo-sort-controls__label">Ordenar por Estrelas</span>
            <div className="repo-sort-controls__options">
              <button
                className={`repo-sort-controls__option ${starsSort === 'stars-asc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleStarsSortClick('stars-asc')}
              >
                Menor → Maior
              </button>
              <button
                className={`repo-sort-controls__option ${starsSort === 'stars-desc' ? 'repo-sort-controls__option--active' : ''}`}
                onClick={() => handleStarsSortClick('stars-desc')}
              >
                Maior → Menor
              </button>
            </div>
          </div>

          <div className="repo-sort-controls__actions">
            <button
              className="repo-sort-controls__clear-btn"
              onClick={handleClear}
            >
              Limpar
            </button>
            <button
              className="repo-sort-controls__apply-btn"
              onClick={handleApply}
              disabled={!hasChanges}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
