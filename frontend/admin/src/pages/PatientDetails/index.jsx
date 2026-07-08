import { useEffect, useState } from 'react';
import { LuChevronLeft, LuPencilLine, LuTrash2 } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatients } from '../../context/patientContext/patientContext';
import PatientNotFound from '../../components/patients/PatientNotFound';
import { formatCpf, formatPhone } from '../../data/patients';
import './styles.css';

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  const normalizedValue = String(date).trim();
  const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return value;
};

const formatPhoneValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return formatPhone(String(value));
};

const formatCpfValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return formatCpf(String(value));
};

export default function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patientState, getPatientById, deletePatient } = usePatients();
  const cachedPatient = patientState.patients.find(
    (currentPatient) => String(currentPatient.id) === String(patientId),
  );
  const [patient, setPatient] = useState(cachedPatient ?? null);
  const [isLoading, setIsLoading] = useState(!cachedPatient);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPatient = async () => {
      if (!cachedPatient) {
        setIsLoading(true);
      }
      setLoadError('');
      setActionError('');

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

        setLoadError(
          error?.message || 'Não foi possível carregar o paciente no momento.',
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

  const handleDelete = async () => {
    if (!patient) {
      return;
    }

    const hasConfirmedDeletion = window.confirm(
      `Deseja excluir o paciente ${patient.name}? Esta ação também remove o usuário vinculado.`,
    );

    if (!hasConfirmedDeletion) {
      return;
    }

    setIsDeleting(true);
    setActionError('');

    try {
      await deletePatient(patient.id);
      navigate('/patients', {
        state: {
          successMessage: `Paciente ${patient.name} excluído com sucesso.`,
        },
      });
    } catch (error) {
      setActionError(
        error?.message || 'Não foi possível excluir o paciente.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loadError && !patient) {
    return (
      <main className="patient-details-page">
        <section className="patient-details-card">
          <p className="patient-details-message">{loadError}</p>
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

      {actionError ? (
        <section className="patient-details-card patient-details-card--error">
          <p className="patient-details-message">{actionError}</p>
        </section>
      ) : null}

      <section className="patient-details-card">
        <header className="patient-details-card__header">
          <div className="patient-details-identity">
            <div>
              <span className="patient-details-identity__badge">Ficha do paciente</span>
              <h1>{formatValue(patient.name)}</h1>
              <p>{formatValue(patient.email)}</p>
            </div>
          </div>

          <div className="patient-details-actions">
            <button
              type="button"
              className="patient-details-edit-button"
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
            >
              <LuPencilLine size={16} />
              Editar paciente
            </button>
            <button
              type="button"
              className="patient-details-delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <LuTrash2 size={16} />
              {isDeleting ? 'Excluindo...' : 'Excluir paciente'}
            </button>
          </div>
        </header>

        <div className="patient-details-grid">
          <article className="patient-details-field">
            <span>Nome</span>
            <strong>{formatValue(patient.name)}</strong>
          </article>

          <article className="patient-details-field">
            <span>CPF</span>
            <strong>{formatCpfValue(patient.cpf)}</strong>
          </article>

          <article className="patient-details-field">
            <span>Telefone / WhatsApp</span>
            <strong>{formatPhoneValue(patient.phone)}</strong>
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
            <strong>{formatValue(patient.id)}</strong>
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
