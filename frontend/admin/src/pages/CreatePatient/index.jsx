import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import { usePatients } from '../../context/patientContext/patientContext';

export default function CreatePatient() {
  const navigate = useNavigate();
  const { createPatient } = usePatients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await createPatient(formData);

      navigate('/patients', {
        state: { successMessage: `Paciente ${formData.name} cadastrado com sucesso.` },
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível cadastrar o paciente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PatientForm
      variant="create"
      onSave={handleSave}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}
