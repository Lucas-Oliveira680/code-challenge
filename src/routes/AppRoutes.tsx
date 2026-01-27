import { Route, Routes } from 'react-router-dom';
import { Search } from '@features/search/Search';
import { Results } from '@features/results/Results';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Search />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
};