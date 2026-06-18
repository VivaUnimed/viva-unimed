import { Navigate, Route, Routes } from 'react-router';
import Login from '../pages/Login';
import RedirectIfAuthenticated from '../components/RedirectIfAuthenticated';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';
import AdminDashboard from '../pages/AdminDashboard';
import Professionals from '../pages/Professionals';
import Vacancies from '../pages/Vacancies';
import Patients from '../pages/Patients';
import WeeklySchedule from '../pages/WeeklySchedule';

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
          <Route path="/weeklySchedule" element={<WeeklySchedule/>} />
          <Route path="/vacancies" element={<Vacancies/>} />
          <Route path="/patients" element={<Patients/>} />
          <Route path="/settings" element={<div/>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
