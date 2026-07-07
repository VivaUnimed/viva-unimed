import { useEffect, useState } from 'react';
import { LuChevronLeft, LuPencilLine } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatients } from '../../context/patientContext/patientContext';
import PatientNotFound from '../../components/patients/PatientNotFound';
import './styles.css';

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return value;
};

export default function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patientState, getPatients } = usePatients();
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(
    patientState.adminPatients.length > 0,
  );
  const patient = patientState.adminPatients.find(
    (currentPatient) => String(currentPatient.patientId) === String(patientId),
  );

  useEffect(() => {
    if (patientState.adminPatients.length > 0) {
      setHasAttemptedInitialLoad(true);
      return;
    }

    let isMounted = true;

    const loadPatients = async () => {
      try {
        await getPatients();
      } catch {
        // O erro fica disponível em patientState.error.
      } finally {
        if (isMounted) {
          setHasAttemptedInitialLoad(true);
        }
      }
    };

    loadPatients();

    return () => {
      isMounted = false;
    };
  }, [patientState.adminPatients.length]);

  if (
    patientState.isLoading ||
    (!hasAttemptedInitialLoad &&
      patientState.adminPatients.length === 0 &&
      !patientState.error)
  ) {
    return (
      <main className="patient-details-page">
        <section className="patient-details-card">
          <p className="patient-details-message">Carregando paciente...</p>
        </section>
      </main>
    );
  }

  if (patientState.error) {
    return (
      <main className="patient-details-page">
        <section className="patient-details-card">
          <p className="patient-details-message">
            Não foi possível carregar o paciente no momento.
          </p>
        </section>
      </main>
    );
  }

  if (!patient) {
    return <PatientNotFound />;
  }

  return (
    <main className="patient-details-page">
      <section className="patient-details-header">
        <div>
          <button
            type="button"
            className="patient-details-back-button"
            onClick={() => navigate('/patients')}
          >
            <LuChevronLeft size={18} />
            Voltar para gestão de pacientes
          </button>
        </div>
      </section>

      <section className="patient-details-card">
        <header className="patient-details-card__header">
          <div className="patient-details-identity">
            <div>
              <span className="patient-details-identity__badge">Ficha do paciente</span>
              <h1>{formatValue(patient.name)}</h1>
              <p>{formatValue(patient.email)}</p>
            </div>
          </div>

          <button
            type="button"
            className="patient-details-edit-button"
            onClick={() => navigate(`/patients/${patient.patientId}/edit`)}
          >
            <LuPencilLine size={16} />
            Editar paciente
          </button>
        </header>

        <div className="patient-details-grid">
          <article className="patient-details-field">
            <span>Nome</span>
            <strong>{formatValue(patient.name)}</strong>
          </article>

          <article className="patient-details-field">
            <span>CPF</span>
            <strong>{formatValue(patient.cpf)}</strong>
          </article>

          <article className="patient-details-field">
            <span>Telefone / WhatsApp</span>
            <strong>{formatValue(patient.phone)}</strong>
          </article>

          <article className="patient-details-field">
            <span>E-mail</span>
            <strong>{formatValue(patient.email)}</strong>
          </article>

          <article className="patient-details-field">
            <span>Data de nascimento</span>
            <strong>{formatDate(patient.birth)}</strong>
          </article>

          <article className="patient-details-field">
            <span>ID do paciente</span>
            <strong>{formatValue(patient.patientId)}</strong>
          </article>

          <article className="patient-details-field">
            <span>ID do usuário</span>
            <strong>{formatValue(patient.userId)}</strong>
          </article>

          <article className="patient-details-field">
            <span>Data de cadastro</span>
            <strong>{formatDate(patient.createdAt)}</strong>
          </article>

          <article className="patient-details-field">
            <span>Última atualização</span>
            <strong>{formatDate(patient.updatedAt)}</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
