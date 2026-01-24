import { Route, Routes } from 'react-router-dom';
import { Search } from '../features/search/Search';
import { Details } from '../features/details/Details';
import { Results } from '../features/results/Results';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Search />} />
      <Route path="/details" element={<Details />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
};