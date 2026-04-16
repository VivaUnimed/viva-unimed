import { Navigate, Route, Routes } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';

export const RoutesApp = () => {
  return (
    <Routes>
      {/* --- Rotas Públicas --- */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoutes />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<></>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
