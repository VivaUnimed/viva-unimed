import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import AuthProvider from './context/authContext/authProvider.jsx';
import ProfessionalProvider from './context/professionalContext/professionalProvider.jsx';
import PatientProvider from './context/patientContext/patientProvider.jsx';
import SpecialtyProvider from './context/specialtyContext/specialtyProvider.jsx';
import VacancyProvider from './context/vacancyContext/vacancyProvider.jsx';
import QueueProvider from './context/queueContext/queueProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfessionalProvider>
        <PatientProvider>
          <SpecialtyProvider>
            <VacancyProvider>
              <QueueProvider>
                <StrictMode>
                  <App />
                </StrictMode>
              </QueueProvider>
            </VacancyProvider>
          </SpecialtyProvider>
        </PatientProvider>
      </ProfessionalProvider>
    </AuthProvider>
  </BrowserRouter>,
);
