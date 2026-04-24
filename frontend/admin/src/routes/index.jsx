import { Navigate, Route, Routes } from 'react-router';
import Login from '../pages/Login';
import RedirectIfAuthenticated from '../components/RedirectIfAuthenticated';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';
import AdminDashboard from '../pages/AdminDashboard';
import Professionals from '../pages/Professionals';

export const RoutesApp = () => {
  return (
    <Routes>
      {/* --- Rotas Públicas --- */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoutes />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<AdminDashboard/>} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/schedule" element={<div/>} />
          <Route path="/vacancies" element={<div/>} />
          <Route path="/patients" element={<div/>} />
          <Route path="/settings" element={<div/>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
