import { LuCalendarDays, LuChevronLeft, LuClock3, LuPencilLine } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import ProfessionalNotFound from '../../components/professionals/ProfessionalNotFound';
import {
  formatProfessionalRegistration,
  getStoredProfessionals,
} from '../../data/professionals';
import './styles.css';

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

const formatShift = (shift = {}) => `${shift.start ?? '--:--'} - ${shift.end ?? '--:--'}`;

export default function ProfessionalDetails() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const professionals = getStoredProfessionals();
  const professional = professionals.find(
    (currentProfessional) =>
      String(currentProfessional.id) === String(professionalId),
  );

  if (!professional) {
    return <ProfessionalNotFound />;
  }

  const formattedWorkload = professional.weeklyHours
    ? `${professional.weeklyHours}h semanais`
    : 'Carga horária não informada';

  return (
    <main className="professional-details-page">
      <section className="professional-details-header">
        <div>
          <button
            type="button"
            className="professional-details-back-button"
            onClick={() => navigate('/professionals')}
          >
            <LuChevronLeft size={18} />
            Voltar para gestão de profissionais
          </button>
        </div>
      </section>

      <section className="professional-details-card">
        <header className="professional-details-card__header">
          <div className="professional-details-identity">
            <img src={professional.avatar} alt={professional.name} />

            <div>
              <span className="professional-details-identity__badge">
                Ficha do profissional
              </span>
              <h1>{professional.name}</h1>
              <p>{professional.email}</p>
            </div>
          </div>

          <button
            type="button"
            className="professional-details-edit-button"
            onClick={() => navigate(`/professionals/${professional.id}/edit`)}
          >
            <LuPencilLine size={16} />
            Editar profissional
          </button>
        </header>

        <div className="professional-details-grid">
          <article className="professional-details-field">
            <span>Nome</span>
            <strong>{professional.name}</strong>
          </article>

          <article className="professional-details-field">
            <span>CRM</span>
            <strong>{formatProfessionalRegistration(professional)}</strong>
          </article>

          <article className="professional-details-field">
            <span>Telefone</span>
            <strong>{professional.phone || 'Não informado'}</strong>
          </article>

          <article className="professional-details-field">
            <span>E-mail</span>
            <strong>{professional.email}</strong>
          </article>

          <article className="professional-details-field">
            <span>Status</span>
            <div>
              <span
                className={`professional-details-status professional-details-status--${toSlug(professional.status)}`}
              >
                {professional.status}
              </span>
            </div>
          </article>

          <article className="professional-details-field">
            <span>Unidade</span>
            <strong>{professional.unit || 'Não informada'}</strong>
          </article>

          <article className="professional-details-field">
            <span>Carga horária</span>
            <div className="professional-details-meta">
              <LuClock3 size={16} />
              <strong>{formattedWorkload}</strong>
            </div>
          </article>

          <article className="professional-details-field">
            <span>Dias de atendimento</span>
            <div className="professional-details-meta">
              <LuCalendarDays size={16} />
              <strong>{professional.schedule.days.join(', ')}</strong>
            </div>
          </article>

          <article className="professional-details-field professional-details-field--full">
            <span>Especialidades</span>
            <div className="professional-details-specialties">
              {professional.specialties.map((specialty) => (
                <span key={specialty} className="professional-details-specialty-badge">
                  {specialty}
                </span>
              ))}
            </div>
          </article>

          <article className="professional-details-field professional-details-field--full">
            <span>Horários de atendimento</span>
            <div className="professional-details-schedule">
              <div className="professional-details-schedule__shift">
                <small>Turno da manhã</small>
                <strong>{formatShift(professional.schedule.morning)}</strong>
              </div>

              <div className="professional-details-schedule__shift">
                <small>Turno da tarde</small>
                <strong>{formatShift(professional.schedule.afternoon)}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
