import { useNavigate, useParams } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import PatientNotFound from '../../components/patients/PatientNotFound';
import { usePatients } from '../../context/patientContext/patientContext';
import { getPatientFormInitialValues } from '../../data/patients';

export default function EditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patientState, updatePatient } = usePatients();
  const patient = patientState.patients.find(
    (currentPatient) => String(currentPatient.id) === String(patientId),
  );

  if (!patient) {
    return <PatientNotFound />;
  }

  const handleSave = (formData) => {
    const updatedPatient = updatePatient(patientId, formData);

    if (!updatedPatient) {
      return;
    }

    navigate('/patients', {
      state: { successMessage: 'Paciente atualizado com sucesso.' },
    });
  };

  return (
    <PatientForm
      key={patient.id}
      variant="edit"
      initialValues={getPatientFormInitialValues(patient)}
      onSave={handleSave}
    />
  );
}
