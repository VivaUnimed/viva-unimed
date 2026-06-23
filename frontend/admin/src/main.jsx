import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import AuthProvider from './context/authContext/authProvider.jsx';
import ProfessionalProvider from './context/professionalContext/professionalProvider.jsx';
import PatientProvider from './context/patientContext/patientProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfessionalProvider>
        <PatientProvider>
          <StrictMode>
            <App />
          </StrictMode>
        </PatientProvider>
      </ProfessionalProvider>
    </AuthProvider>
  </BrowserRouter>,
);
