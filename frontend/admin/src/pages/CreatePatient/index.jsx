import { useNavigate } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import { usePatients } from '../../context/patientContext/patientContext';

export default function CreatePatient() {
  const navigate = useNavigate();
  const { createPatient } = usePatients();

  const handleSave = (formData) => {
    const patient = createPatient(formData);

    navigate('/patients', {
      state: { successMessage: `Paciente ${patient.name} cadastrado com sucesso.` },
    });
  };

  return <PatientForm variant="create" onSave={handleSave} />;
}
