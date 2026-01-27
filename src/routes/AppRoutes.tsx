import { Route, Routes } from 'react-router-dom';
import { Search } from '@features/search/Search';
import { Results } from '@features/results/Results';
import { RepositoryDetails } from '@features/repository/RepositoryDetails';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Search />} />
      <Route path="/results" element={<Results />} />
      <Route path="/repository" element={<RepositoryDetails />} />
    </Routes>
  );
};