import { Navigate, Route, Routes } from 'react-router';
import Login from '../pages/Login';
import RedirectIfAuthenticated from '../components/RedirectIfAuthenticated';
import PrivateRoutes from '../components/PrivateRoutes';
import PrivateLayout from '../components/layouts/PrivateLayout';
import AdminDashboard from '../pages/AdminDashboard';
import Professionals from '../pages/Professionals';
import Specialties from '../pages/Specialties';
import Vacancies from '../pages/Vacancies';
import Patients from '../pages/Patients';
import WeeklySchedule from '../pages/WeeklySchedule';
import CreateProfessional from '../pages/CreateProfessional';
import EditProfessional from '../pages/EditProfessional';
import NoShowRegistration from '../pages/NoShowRegistration';
import CreatePatient from '../pages/CreatePatient';
import PatientDetails from '../pages/PatientDetails';
import EditPatient from '../pages/EditPatient';
import ProfessionalDetails from '../pages/ProfessionalDetails';
import VacancyDetails from '../pages/VacancyDetails';
import Settings from '../pages/Settings';
import Queue from '../pages/Queue';
import QueueDetails from '../pages/QueueDetails';

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
          <Route path="/professionals/new" element={<CreateProfessional />} />
          <Route path="/professionals/:professionalId" element={<ProfessionalDetails />} />
          <Route path="/professionals/:professionalId/edit" element={<EditProfessional />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/weeklySchedule" element={<WeeklySchedule/>} />
          <Route path="/vacancies" element={<Vacancies/>} />
          <Route path="/vacancies/:vacancyId" element={<VacancyDetails />} />
          <Route path="/vacancies/new" element={<NoShowRegistration/>} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/queue/:queueRequestId" element={<QueueDetails />} />
          <Route path="/patients" element={<Patients/>} />
          <Route path="/patients/new" element={<CreatePatient />} />
          <Route path="/patients/:patientId/edit" element={<EditPatient />} />
          <Route path="/patients/:patientId" element={<PatientDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
