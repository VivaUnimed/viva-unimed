import { useEffect, useState } from 'react';
import {
  LuBadgeAlert,
  LuCalendarCheck,
  LuChevronLeft,
  LuCircleCheck,
  LuClock3,
  LuHistory,
  LuPencilLine,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import {
  canEditVacancy,
  canDeleteVacancy,
  getVacancyStatusDescription,
  vacancyEditUnavailableMessage,
} from '../../data/vacancies';
import './styles.css';

function getPageCopy(vacancy) {
  if (vacancy.vacancyStatus === 'booked') {
    return {
      eyebrow: 'Vaga reservada',
      title: `${vacancy.specialty} • ${vacancy.time}`,
      description:
        'Esta vaga já foi reservada e segue disponível apenas para consulta.',
      highlightTitle: 'Reserva confirmada',
      highlightDescription:
        'A vaga não está mais disponível para novos encaminhamentos.',
      highlightModifier: 'confirmed',
    };
  }

  if (vacancy.vacancyStatus === 'expired') {
    return {
      eyebrow: 'Vaga encerrada',
      title: `${vacancy.specialty} • ${vacancy.time}`,
      description:
        'O horário desta vaga já expirou e o registro permanece disponível para consulta.',
      highlightTitle: 'Prazo encerrado',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  if (vacancy.vacancyStatus === 'cancelled') {
    return {
      eyebrow: 'Vaga encerrada',
      title: `${vacancy.specialty} • ${vacancy.time}`,
      description:
        'Esta vaga foi cancelada e permanece visível para acompanhamento.',
      highlightTitle: 'Cancelamento registrado',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  if (vacancy.vacancyStatus === 'no_show') {
    return {
      eyebrow: 'Histórico da vaga',
      title: `${vacancy.specialty} • ${vacancy.time}`,
      description:
        'Esta vaga teve registro de não comparecimento e permanece no histórico.',
      highlightTitle: 'Não comparecimento registrado',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  return {
    eyebrow: 'Gestão da vaga',
    title: `${vacancy.specialty} • ${vacancy.time}`,
    description:
      'Acompanhe as principais informações da vaga e os pacientes compatíveis no momento.',
    highlightTitle: 'Vaga disponível',
    highlightDescription:
      vacancy.queuePatients > 0
        ? `Existem ${vacancy.queuePatients} ${vacancy.queuePatients === 1 ? 'paciente compatível' : 'pacientes compatíveis'} para esta vaga no momento.`
        : 'No momento, não há pacientes compatíveis para esta vaga.',
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
      label: 'Data da vaga',
      value: vacancy.date,
      icon: LuCalendarCheck,
    },
    {
      label: 'Horário',
      value: vacancy.time,
      icon: LuClock3,
    },
    {
      label: 'Status da vaga',
      value: vacancy.vacancyStatusText,
      badgeModifier: vacancy.vacancyStatus,
      icon: vacancy.vacancyStatus === 'booked' ? LuCircleCheck : LuClock3,
    },
    {
      label: 'Pacientes na fila',
      value: `${vacancy.queuePatients} ${vacancy.queuePatients === 1 ? 'paciente' : 'pacientes'}`,
      icon: LuUsers,
    },
    {
      label: 'Código da vaga',
      value: String(vacancy.id),
    },
    {
      label: 'Registrada por',
      value: vacancy.createdByEmail
        ? `${vacancy.createdByName} • ${vacancy.createdByEmail}`
        : vacancy.createdByName,
    },
  ];
}

export default function VacancyDetails() {
  const navigate = useNavigate();
  const { vacancyId } = useParams();
  const { getVacancyById, deleteVacancy } = useVacancies();
  const [vacancy, setVacancy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadVacancy = async () => {
      setIsLoading(true);
      setPageError('');
      setIsNotFound(false);

      try {
        const loadedVacancy = await getVacancyById(vacancyId);

        if (!isMounted) {
          return;
        }

        setVacancy(loadedVacancy);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error?.message === 'NotFound') {
          setIsNotFound(true);
          setVacancy(null);
          return;
        }

        setPageError(error?.message || 'Não foi possível carregar a vaga.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVacancy();

    return () => {
      isMounted = false;
    };
  }, [vacancyId]);

  const handleDelete = async () => {
    if (!vacancy) {
      return;
    }

    const isConfirmed = window.confirm(
      `Deseja excluir a vaga #${vacancy.id}? Esta ação removerá o registro da lista de vagas.`,
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    setPageError('');

    try {
      await deleteVacancy(vacancy.id);

      navigate('/vacancies', {
        state: {
          successMessage: `Vaga #${vacancy.id} excluída com sucesso.`,
        },
      });
    } catch (error) {
      setPageError(error?.message || 'Não foi possível excluir a vaga.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="vacancy-details-page">
        <section className="vacancy-details-card vacancy-details-card--empty">
          <span className="vacancy-details-eyebrow">Consulta de vaga</span>
          <h1>Carregando vaga...</h1>
          <p>Aguarde enquanto buscamos os dados da vaga.</p>
        </section>
      </main>
    );
  }

  if (isNotFound) {
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
          <p>A vaga informada não foi encontrada.</p>

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

  if (!vacancy) {
    return (
      <main className="vacancy-details-page">
        <section className="vacancy-details-card vacancy-details-card--empty">
          <span className="vacancy-details-eyebrow">Consulta de vaga</span>
          <h1>Não foi possível carregar a vaga.</h1>
          <p>{pageError || 'Tente novamente em instantes.'}</p>
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
        {pageError ? (
          <div className="vacancy-details-alert" role="alert">
            <LuBadgeAlert size={18} />
            <span>{pageError}</span>
          </div>
        ) : null}

        <header className="vacancy-details-card__header">
          <div className="vacancy-details-identity">
            <div>
              <span className="vacancy-details-eyebrow">{pageCopy.eyebrow}</span>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.description}</p>

              <div className="vacancy-details-badges">
                <span className={`vacancy-details-badge vacancy-details-badge--${vacancy.vacancyStatus}`}>
                  {vacancy.vacancyStatusText}
                </span>
                <span className="vacancy-details-badge vacancy-details-badge--info">
                  Pacientes na fila: {vacancy.queuePatients}
                </span>
              </div>
            </div>
          </div>

          <div className="vacancy-details-actions">
            <button
              type="button"
              className="vacancy-details-edit-button"
              disabled={!canEditVacancy(vacancy)}
              title={vacancyEditUnavailableMessage}
            >
              <LuPencilLine size={16} />
              Editar vaga
            </button>

            <button
              type="button"
              className="vacancy-details-delete-button"
              onClick={handleDelete}
              disabled={isDeleting || !canDeleteVacancy(vacancy)}
              title={
                canDeleteVacancy(vacancy)
                  ? 'Excluir vaga'
                  : 'Vagas reservadas ou com não comparecimento não podem ser excluídas.'
              }
            >
              <LuTrash2 size={16} />
              {isDeleting ? 'Excluindo...' : 'Excluir vaga'}
            </button>
          </div>
        </header>

        <section
          className={`vacancy-highlight vacancy-highlight--${pageCopy.highlightModifier}`}
        >
          <div className="vacancy-highlight__icon">
            {vacancy.vacancyStatus === 'booked'
              ? <LuCircleCheck size={22} />
              : <LuHistory size={22} />}
          </div>

          <div>
            <span className="vacancy-highlight__label">Resumo</span>
            <strong>{pageCopy.highlightTitle}</strong>
            <p>{pageCopy.highlightDescription}</p>
          </div>
        </section>

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
            <LuUsers size={18} />
            <div>
              <h2>Fila compatível</h2>
              <p>
                Pacientes compatíveis com esta vaga neste momento.
              </p>
            </div>
          </div>

          <div className="vacancy-history__list">
            {vacancy.queueRequests.length > 0 ? (
              vacancy.queueRequests.map((queueRequest) => (
                <article key={queueRequest.id} className="vacancy-history__item">
                  <span>{queueRequest.requestedDateTime}</span>
                  <strong>{queueRequest.patientName}</strong>
                  <p>
                    {queueRequest.doctorScopeLabel}. Tentativas de contato: {queueRequest.attempts}.{' '}
                    {queueRequest.cooldownLabel}.
                  </p>
                </article>
              ))
            ) : (
              <article className="vacancy-history__item">
                <span>Fila compatível</span>
                <strong>Nenhum paciente compatível no momento</strong>
                <p>
                  Quando houver pacientes elegíveis para esta vaga, eles aparecerão aqui.
                </p>
              </article>
            )}
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

          <p className="vacancy-details-footer__helper">
            {vacancyEditUnavailableMessage}
          </p>

          {!canDeleteVacancy(vacancy) ? (
            <p className="vacancy-details-footer__helper">
              Vagas reservadas ou com não comparecimento não podem ser excluídas.
            </p>
          ) : null}
        </footer>
      </section>
    </main>
  );
}
