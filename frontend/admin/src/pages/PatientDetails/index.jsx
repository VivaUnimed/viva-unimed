import { LuBadgeAlert, LuBadgeCheck, LuChevronLeft, LuPencilLine } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatients } from '../../context/patientContext/patientContext';
import PatientNotFound from '../../components/patients/PatientNotFound';
import './styles.css';

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

export default function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { patientState } = usePatients();
  const patient = patientState.patients.find(
    (currentPatient) => String(currentPatient.id) === String(patientId),
  );

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
            <img src={patient.avatar} alt={patient.name} />

            <div>
              <span className="patient-details-identity__badge">Ficha do paciente</span>
              <h1>{patient.name}</h1>
              <p>{patient.email}</p>
            </div>
          </div>

          <button
            type="button"
            className="patient-details-edit-button"
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
          >
            <LuPencilLine size={16} />
            Editar paciente
          </button>
        </header>

        <div className="patient-details-grid">
          <article className="patient-details-field">
            <span>Nome</span>
            <strong>{patient.name}</strong>
          </article>

          <article className="patient-details-field">
            <span>CPF</span>
            <strong>{patient.cpf}</strong>
          </article>

          <article className="patient-details-field">
            <span>Telefone / WhatsApp</span>
            <strong>{patient.phone}</strong>
          </article>

          <article className="patient-details-field">
            <span>E-mail</span>
            <strong>{patient.email}</strong>
          </article>

          <article className="patient-details-field">
            <span>Status</span>
            <div>
              <span className={`patient-details-status patient-details-status--${toSlug(patient.status)}`}>
                {patient.status}
              </span>
            </div>
          </article>

          <article className="patient-details-field">
            <span>Situação do telefone</span>
            <div>
              <span
                className={`patient-details-contact-badge patient-details-contact-badge--${patient.phoneValid ? 'valid' : 'invalid'}`}
              >
                {patient.phoneValid ? <LuBadgeCheck size={16} /> : <LuBadgeAlert size={16} />}
                {patient.phoneValid ? 'Válido' : 'Inválido'}
              </span>
            </div>
          </article>

          <article className="patient-details-field patient-details-field--full">
            <span>Especialidades de interesse</span>
            <div className="patient-details-interests">
              {patient.interests.map((interest) => (
                <span key={interest} className="patient-details-interest-badge">
                  {interest}
                </span>
              ))}
            </div>
          </article>

          <article className="patient-details-field">
            <span>Última notificação</span>
            <strong>{patient.lastNotificationDate}</strong>
            <small
              className={`patient-details-notification patient-details-notification--${toSlug(patient.lastNotificationStatus)}`}
            >
              {patient.lastNotificationStatus}
            </small>
          </article>

          <article className="patient-details-field">
            <span>Última confirmação</span>
            {patient.lastConfirmationDate ? (
              <>
                <strong>{patient.lastConfirmationDate}</strong>
                <small>{patient.lastConfirmationSpecialty}</small>
              </>
            ) : (
              <>
                <strong>Nenhuma confirmação</strong>
                <small>Sem retorno registrado</small>
              </>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
