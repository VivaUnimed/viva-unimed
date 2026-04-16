import { Navigate, Route, Routes } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';
import RedirectIfAuthenticated from '../components/RedirectIfAuthenticated';

export const RoutesApp = () => {
  return (
    <Routes>
      {/* --- Rotas Públicas --- */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoutes />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<div></div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
