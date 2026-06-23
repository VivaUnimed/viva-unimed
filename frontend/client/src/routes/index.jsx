import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';
import RedirectIfAuthenticated from '../components/RedirectIfAuthenticated';
import Alertas from '../pages/Alertas';
import Consultas from '../pages/Consultas';
import ConsultasDetalhes from '../pages/ConsultasDetalhes';
import Interesses from '../pages/Interesses';
import Perfil from '../pages/Perfil';
import ResetPassword from '../pages/ResetPassword';
import Vagas from '../pages/Vagas';

export const RoutesApp = () => {
  return (
    <Routes>
      {/* --- Rotas Públicas --- */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoutes />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Consultas />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route
            path="/consultas-detalhes"
            element={<ConsultasDetalhes />}
          />
          <Route
            path="/consultas-detalhes/:consultaId"
            element={<ConsultasDetalhes />}
          />
          <Route
            path="/interesses"
            element={<Interesses />}
          />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/vagas" element={<Vagas />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
