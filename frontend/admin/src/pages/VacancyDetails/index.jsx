import {
  LuCalendarCheck,
  LuChevronLeft,
  LuCircleCheck,
  LuCircleX,
  LuClock3,
  LuHistory,
  LuSend,
  LuUsers,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import {
  findVacancyById,
  getVacancyFinalDescription,
} from '../../data/vacancies';
import './styles.css';

function getPageCopy(vacancy) {
  if (vacancy.vacancyStatus === 'confirmed') {
    return {
      eyebrow: 'Confirmação registrada',
      title: 'Paciente confirmado para a vaga',
      description: 'A fila inteligente concluiu o aceite e a vaga está finalizada.',
      highlightTitle: vacancy.confirmedPatient || 'Paciente confirmado',
      highlightDescription: vacancy.acceptanceTimestamp || 'Aceite registrado no mock.',
      highlightModifier: 'confirmed',
    };
  }

  if (vacancy.vacancyStatus === 'expired') {
    return {
      eyebrow: 'Vaga encerrada',
      title: 'A vaga expirou sem aceite',
      description: 'Os dados finais permanecem disponíveis para consulta do admin.',
      highlightTitle: 'Motivo do encerramento',
      highlightDescription: getVacancyFinalDescription(vacancy),
      highlightModifier: 'ended',
    };
  }

  if (vacancy.vacancyStatus === 'cancelled') {
    return {
      eyebrow: 'Vaga encerrada',
      title: 'A vaga foi cancelada pela unidade',
      description: 'O histórico permanece disponível para acompanhamento da operação.',
      highlightTitle: 'Motivo do encerramento',
      highlightDescription: getVacancyFinalDescription(vacancy),
      highlightModifier: 'ended',
    };
  }

  return {
    eyebrow: 'Gestão da vaga',
    title: `${vacancy.specialty} • ${vacancy.time}`,
    description:
      'A fila inteligente segue automatizada após o cadastro. Esta tela serve para consulta e acompanhamento.',
    highlightTitle: 'Acompanhamento ativo',
    highlightDescription:
      'Use os dados abaixo para acompanhar status, expiração, fila e histórico da vaga sem iniciar manualmente o processamento.',
    highlightModifier: 'active',
  };
}

function getDetailsFields(vacancy) {
  return [
    {
      label: 'Especialidade',
      value: vacancy.specialty,
    },
    {
      label: 'Profissional',
      value: vacancy.professional,
    },
    {
      label: 'Data e horário',
      value: `${vacancy.date} às ${vacancy.time}`,
    },
    {
      label: 'Pacientes na fila',
      value: `${vacancy.queuePatients} ${vacancy.queuePatients === 1 ? 'paciente' : 'pacientes'}`,
      icon: LuUsers,
    },
    {
      label: 'Status da vaga',
      value: vacancy.vacancyStatusText,
      badgeModifier: vacancy.vacancyStatus,
      icon: vacancy.vacancyStatus === 'confirmed' ? LuCircleCheck : LuClock3,
    },
    {
      label: 'Status do disparo',
      value: vacancy.dispatchStatusText,
      badgeModifier: vacancy.dispatchStatus,
      icon: LuSend,
    },
    {
      label: 'Tempo de expiração',
      value: vacancy.expiration,
      icon: LuCalendarCheck,
    },
    {
      label: 'Paciente confirmado',
      value: vacancy.confirmedPatient || 'Nenhum paciente confirmado',
      icon: vacancy.confirmedPatient ? LuCircleCheck : LuCircleX,
    },
  ];
}

export default function VacancyDetails() {
  const navigate = useNavigate();
  const { vacancyId } = useParams();
  const vacancy = findVacancyById(vacancyId);

  if (!vacancy) {
    return (
      <main className="vacancy-details-page">
        <section className="vacancy-details-header">
          <button
            type="button"
            className="vacancy-details-back-button"
            onClick={() => navigate('/vacancies')}
          >
            <LuChevronLeft size={18} />
            Voltar para vagas
          </button>
        </section>

        <section className="vacancy-details-card vacancy-details-card--empty">
          <span className="vacancy-details-eyebrow">Consulta de vaga</span>
          <h1>Vaga não encontrada.</h1>
          <p>O identificador informado não existe nos dados disponíveis do admin.</p>

          <button
            type="button"
            className="vacancy-details-primary-button"
            onClick={() => navigate('/vacancies')}
          >
            Voltar para vagas
          </button>
        </section>
      </main>
    );
  }

  const pageCopy = getPageCopy(vacancy);
  const detailFields = getDetailsFields(vacancy);

  return (
    <main className="vacancy-details-page">
      <section className="vacancy-details-header">
        <button
          type="button"
          className="vacancy-details-back-button"
          onClick={() => navigate('/vacancies')}
        >
          <LuChevronLeft size={18} />
          Voltar para vagas
        </button>
      </section>

      <section className="vacancy-details-card">
        <header className="vacancy-details-card__header">
          <div>
            <span className="vacancy-details-eyebrow">{pageCopy.eyebrow}</span>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>

          <div className="vacancy-details-badges">
            <span className={`vacancy-details-badge vacancy-details-badge--${vacancy.vacancyStatus}`}>
              {vacancy.vacancyStatusText}
            </span>
            <span className={`vacancy-details-badge vacancy-details-badge--${vacancy.dispatchStatus}`}>
              {vacancy.dispatchStatusText}
            </span>
          </div>
        </header>

        <section
          className={`vacancy-highlight vacancy-highlight--${pageCopy.highlightModifier}`}
        >
          <div className="vacancy-highlight__icon">
            {vacancy.vacancyStatus === 'confirmed' ? <LuCircleCheck size={22} /> : <LuHistory size={22} />}
          </div>

          <div>
            <span className="vacancy-highlight__label">
              {vacancy.vacancyStatus === 'confirmed' ? 'Confirmação' : 'Resumo'}
            </span>
            <strong>{pageCopy.highlightTitle}</strong>
            <p>{pageCopy.highlightDescription}</p>
          </div>
        </section>

        {vacancy.acceptanceTimestamp && (
          <section className="vacancy-details-acceptance">
            <span>Data/hora do aceite</span>
            <strong>{vacancy.acceptanceTimestamp}</strong>
          </section>
        )}

        <section className="vacancy-details-grid">
          {detailFields.map((field) => {
            const Icon = field.icon;

            return (
              <article key={field.label} className="vacancy-details-field">
                <span>{field.label}</span>

                <div className="vacancy-details-field__value">
                  {Icon ? <Icon size={16} /> : null}

                  {field.badgeModifier ? (
                    <strong className={`vacancy-details-badge vacancy-details-badge--${field.badgeModifier}`}>
                      {field.value}
                    </strong>
                  ) : (
                    <strong>{field.value}</strong>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="vacancy-history">
          <div className="vacancy-history__header">
            <LuHistory size={18} />
            <div>
              <h2>Histórico resumido da vaga</h2>
              <p>Eventos principais registrados no mock desta operação.</p>
            </div>
          </div>

          <div className="vacancy-history__list">
            {vacancy.history.map((historyItem) => (
              <article key={historyItem.id} className="vacancy-history__item">
                <span>{historyItem.timestamp}</span>
                <strong>{historyItem.title}</strong>
                <p>{historyItem.description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="vacancy-details-footer">
          <button
            type="button"
            className="vacancy-details-primary-button"
            onClick={() => navigate('/vacancies')}
          >
            Voltar para vagas
          </button>
        </footer>
      </section>
    </main>
  );
}
