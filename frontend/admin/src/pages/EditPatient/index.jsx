import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import PatientNotFound from '../../components/patients/PatientNotFound';
import { usePatients } from '../../context/patientContext/patientContext';
import { getPatientFormInitialValues } from '../../data/patients';
import '../PatientDetails/styles.css';

export default function EditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patientState, getPatientById, updatePatient } = usePatients();
  const cachedPatient = patientState.patients.find(
    (currentPatient) => String(currentPatient.id) === String(patientId),
  );
  const [patient, setPatient] = useState(cachedPatient ?? null);
  const [isLoading, setIsLoading] = useState(!cachedPatient);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPatient = async () => {
      if (!cachedPatient) {
        setIsLoading(true);
      }
      setSubmitError('');

      try {
        const loadedPatient = await getPatientById(patientId);

        if (!isMounted) {
          return;
        }

        setPatient(loadedPatient);
        setIsNotFound(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error?.message === 'NotFound') {
          setIsNotFound(true);
          setPatient(null);
          return;
        }

        setSubmitError(
          error?.message || 'Não foi possível carregar o paciente para edição.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      isMounted = false;
    };
  }, [cachedPatient, getPatientById, patientId]);

  if (isLoading) {
    return (
      <main className="patient-details-page">
        <section className="patient-details-card">
          <p className="patient-details-message">Carregando paciente...</p>
        </section>
      </main>
    );
  }

  if (isNotFound) {
    return <PatientNotFound />;
  }

  if (!patient && submitError) {
    return (
      <main className="patient-details-page">
        <section className="patient-details-card">
          <p className="patient-details-message">{submitError}</p>
        </section>
      </main>
    );
  }

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const updatedPatient = await updatePatient(formData, patientId);

      navigate('/patients', {
        state: {
          successMessage: `Paciente ${updatedPatient.name} atualizado com sucesso.`,
        },
      });
    } catch (error) {
      setSubmitError(
        error?.message || 'Não foi possível atualizar o paciente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PatientForm
      key={patient?.id ?? patientId}
      variant="edit"
      initialValues={getPatientFormInitialValues(patient)}
      onSave={handleSave}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}
