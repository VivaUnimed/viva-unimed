import { useEffect, useState } from 'react';
import {
  LuBadgeAlert,
  LuCalendarCheck,
  LuChevronLeft,
  LuCircleCheck,
  LuClock3,
  LuHistory,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import {
  canDeleteVacancy,
  getVacancyStatusDescription,
} from '../../data/vacancies';
import './styles.css';

function getPageCopy(vacancy) {
  if (vacancy.vacancyStatus === 'booked') {
    return {
      eyebrow: 'Vaga reservada',
      title: 'Reserva registrada no backend',
      description:
        'A vaga foi marcada como reservada. Esta consulta não expõe o paciente confirmado pelas rotas atuais.',
      highlightTitle: 'Paciente confirmado não exposto',
      highlightDescription:
        'O backend atual marca a vaga como booked, mas não retorna nesta tela qual paciente aceitou a oferta.',
      highlightModifier: 'confirmed',
    };
  }

  if (vacancy.vacancyStatus === 'expired') {
    return {
      eyebrow: 'Vaga encerrada',
      title: 'A vaga expirou',
      description:
        'O registro continua disponível para consulta administrativa mesmo após a expiração.',
      highlightTitle: 'Expiração registrada',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  if (vacancy.vacancyStatus === 'cancelled') {
    return {
      eyebrow: 'Vaga encerrada',
      title: 'A vaga foi cancelada',
      description:
        'O backend mantém a vaga apenas para acompanhamento administrativo após o cancelamento.',
      highlightTitle: 'Cancelamento registrado',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  if (vacancy.vacancyStatus === 'no_show') {
    return {
      eyebrow: 'Histórico de atendimento',
      title: 'A vaga registra no-show',
      description:
        'O fluxo atual do backend mantém esse registro apenas para consulta e histórico operacional.',
      highlightTitle: 'No-show registrado',
      highlightDescription: getVacancyStatusDescription(vacancy.vacancyStatus),
      highlightModifier: 'ended',
    };
  }

  return {
    eyebrow: 'Gestão da vaga',
    title: `${vacancy.specialty} • ${vacancy.time}`,
    description:
      'A tela reflete apenas os dados expostos hoje pelas rotas de vagas e fila de espera.',
    highlightTitle: 'Processamento automático',
    highlightDescription:
      'A fila inteligente continua sendo processada pelo backend. Aqui o admin acompanha apenas os dados disponíveis nessas rotas.',
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
      label: 'Fila compatível atual',
      value: `${vacancy.queuePatients} ${vacancy.queuePatients === 1 ? 'paciente' : 'pacientes'}`,
      icon: LuUsers,
    },
    {
      label: 'ID da vaga',
      value: String(vacancy.id),
    },
    {
      label: 'Cadastro administrativo',
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
      `Deseja excluir a vaga #${vacancy.id}? O backend atual pode bloquear a exclusão se houver reserva ou vínculos críticos.`,
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
          <p>Aguarde enquanto buscamos os dados atuais do backend.</p>
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
          <p>O identificador informado não existe na base atual do backend.</p>

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
          <div>
            <span className="vacancy-details-eyebrow">{pageCopy.eyebrow}</span>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>

          <div className="vacancy-details-badges">
            <span className={`vacancy-details-badge vacancy-details-badge--${vacancy.vacancyStatus}`}>
              {vacancy.vacancyStatusText}
            </span>
            <span className="vacancy-details-badge vacancy-details-badge--info">
              Fila atual: {vacancy.queuePatients}
            </span>
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
              <h2>Fila compatível no backend</h2>
              <p>
                Solicitações waiting compatíveis com a vaga pelas rotas atuais.
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
                    {queueRequest.doctorScopeLabel}. Tentativas: {queueRequest.attempts}.{' '}
                    {queueRequest.cooldownLabel}.
                  </p>
                </article>
              ))
            ) : (
              <article className="vacancy-history__item">
                <span>Fila atual</span>
                <strong>Nenhum paciente compatível no momento</strong>
                <p>
                  O backend atual não retorna solicitações waiting compatíveis para esta vaga.
                </p>
              </article>
            )}
          </div>
        </section>

        <footer className="vacancy-details-footer">
          <div className="vacancy-details-footer__actions">
            <button
              type="button"
              className="vacancy-details-primary-button"
              onClick={() => navigate('/vacancies')}
            >
              Voltar para vagas
            </button>

            <button
              type="button"
              className="vacancy-details-secondary-button vacancy-details-secondary-button--danger"
              onClick={handleDelete}
              disabled={isDeleting || !canDeleteVacancy(vacancy)}
              title={
                canDeleteVacancy(vacancy)
                  ? 'Excluir vaga'
                  : 'O backend atual não permite excluir vagas reservadas ou com no-show.'
              }
            >
              <LuTrash2 size={16} />
              {isDeleting ? 'Excluindo...' : 'Excluir vaga'}
            </button>
          </div>

          {!canDeleteVacancy(vacancy) ? (
            <p className="vacancy-details-footer__helper">
              O backend atual bloqueia a exclusão de vagas reservadas ou com no-show.
            </p>
          ) : null}
        </footer>
      </section>
    </main>
  );
}
