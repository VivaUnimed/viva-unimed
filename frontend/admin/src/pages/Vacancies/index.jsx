import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  LuCalendarCheck,
  LuChevronDown,
  LuSearch,
  LuHistory,
  LuRefreshCw,
  LuPlus,
  LuClock3,
  LuUsers,
  LuCircleCheck,
  LuCircleX,
  LuSend,
  LuFilter,
} from 'react-icons/lu';

import {
  getSlotAction,
  loadVacancies,
  persistVacancies,
} from '../../data/vacancies';

import './styles.css';

const summaryCards = [
  {
    id: 1,
    label: 'Abertas',
    icon: LuCalendarCheck,
    modifier: 'open',
    matches: (slot) => slot.vacancyStatus === 'open',
  },
  {
    id: 2,
    label: 'Aguardando aceite',
    icon: LuClock3,
    modifier: 'waiting',
    matches: (slot) => slot.vacancyStatus === 'waiting-acceptance',
  },
  {
    id: 3,
    label: 'Confirmadas',
    icon: LuCircleCheck,
    modifier: 'confirmed',
    matches: (slot) => slot.vacancyStatus === 'confirmed',
  },
  {
    id: 4,
    label: 'Expiradas',
    icon: LuHistory,
    modifier: 'expired',
    matches: (slot) => slot.vacancyStatus === 'expired',
  },
  {
    id: 5,
    label: 'Canceladas',
    icon: LuCircleX,
    modifier: 'cancelled',
    matches: (slot) => slot.vacancyStatus === 'cancelled',
  },
  {
    id: 6,
    label: 'Falhas no disparo',
    icon: LuSend,
    modifier: 'error',
    matches: (slot) => slot.dispatchStatus === 'error',
  },
];

const vacancyStatusOptions = [
  { value: '', label: 'Todos os status da vaga' },
  { value: 'open', label: 'Aberta' },
  { value: 'waiting-acceptance', label: 'Aguardando aceite' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'expired', label: 'Expirada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const dispatchStatusOptions = [
  { value: '', label: 'Todos os status do disparo' },
  { value: 'success', label: 'Enviado com sucesso' },
  { value: 'error', label: 'Falha no disparo' },
];

function formatSummaryValue(value) {
  return String(value).padStart(2, '0');
}

function createRetryHistoryEntry(slot) {
  return {
    id: `${slot.id}-retry-${Date.now()}`,
    title: 'Disparo reenviado com sucesso',
    description: 'Nova tentativa simulada a partir da tela de vagas.',
    timestamp: 'Agora',
  };
}

export default function Vacancies() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState(loadVacancies);
  const [searchTerm, setSearchTerm] = useState('');
  const [vacancyStatusFilter, setVacancyStatusFilter] = useState('');
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [queueModalSlot, setQueueModalSlot] = useState(null);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackMessage('');
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [feedbackMessage]);

  const dateOptions = [...new Set(slots.map((slot) => slot.date))];
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const hasActiveFilters = Boolean(
    normalizedSearchTerm
    || vacancyStatusFilter
    || dispatchStatusFilter
    || dateFilter
  );

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch = !normalizedSearchTerm
      || slot.specialty.toLowerCase().includes(normalizedSearchTerm)
      || slot.professional.toLowerCase().includes(normalizedSearchTerm)
      || slot.confirmedPatient?.toLowerCase().includes(normalizedSearchTerm);

    const matchesVacancyStatus = !vacancyStatusFilter
      || slot.vacancyStatus === vacancyStatusFilter;

    const matchesDispatchStatus = !dispatchStatusFilter
      || slot.dispatchStatus === dispatchStatusFilter;

    const matchesDate = !dateFilter || slot.date === dateFilter;

    return (
      matchesSearch
      && matchesVacancyStatus
      && matchesDispatchStatus
      && matchesDate
    );
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setVacancyStatusFilter('');
    setDispatchStatusFilter('');
    setDateFilter('');
  };

  const updateSlots = (updater) => {
    setSlots((currentSlots) => {
      const nextSlots = typeof updater === 'function'
        ? updater(currentSlots)
        : updater;

      persistVacancies(nextSlots);
      return nextSlots;
    });
  };

  const handleRetryDispatch = (slot) => {
    updateSlots((currentSlots) =>
      currentSlots.map((currentSlot) => {
        if (currentSlot.id !== slot.id) {
          return currentSlot;
        }

        return {
          ...currentSlot,
          dispatchStatus: 'success',
          dispatchStatusText: 'Enviado com sucesso',
          vacancyStatus: 'waiting-acceptance',
          vacancyStatusText: 'Aguardando aceite',
          expiration: 'Expira em 15 min',
          finalDescription: '',
          history: [...currentSlot.history, createRetryHistoryEntry(currentSlot)],
        };
      }),
    );

    setFeedbackMessage('Disparo reenviado com sucesso.');
  };

  const handleSlotAction = (slot) => {
    const action = getSlotAction(slot);

    switch (action.label) {
      case 'Gerenciar':
      case 'Ver confirmação':
      case 'Detalhes':
        navigate(`/vacancies/${slot.id}`);
        break;
      case 'Tentar novamente':
        handleRetryDispatch(slot);
        break;
      case 'Ver fila':
        setQueueModalSlot(slot);
        break;
      default:
        break;
    }
  };

  return (
    <main className="idle-slots-page">
      <section className="idle-slots-header">
        <div>
          <h1>Vagas</h1>
          <p>
            Gestão de vagas remanescentes, disparos e confirmações de pacientes.
          </p>
        </div>

        <button
          type="button"
          className="new-vacancy-button"
          onClick={() => navigate('/vacancies/new', {
            state: {
              returnTo: '/vacancies',
              returnLabel: 'vagas',
            },
          })}
        >
          <LuPlus size={18} />
          Nova vaga
        </button>
      </section>

      {feedbackMessage ? (
        <div className="vacancy-feedback-banner" role="status">
          <LuCircleCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      <section className="vacancy-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = slots.filter(card.matches).length;

          return (
            <article
              key={card.id}
              className={`vacancy-summary-card vacancy-summary-card--${card.modifier}`}
            >
              <div>
                <span>{card.label}</span>
                <strong>{formatSummaryValue(value)}</strong>
              </div>

              <div className="vacancy-summary-card__icon">
                <Icon size={20} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="vacancy-filters">
        <div className="vacancy-filters__search">
          <LuSearch size={18} />
          <input
            type="text"
            placeholder="Buscar por especialidade ou profissional..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <label className="vacancy-filter-select">
          <LuFilter size={16} />
          <select
            value={vacancyStatusFilter}
            onChange={(event) => setVacancyStatusFilter(event.target.value)}
            aria-label="Filtrar por status da vaga"
          >
            {vacancyStatusOptions.map((option) => (
              <option key={option.value || 'all-vacancy-status'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <label className="vacancy-filter-select">
          <LuSend size={16} />
          <select
            value={dispatchStatusFilter}
            onChange={(event) => setDispatchStatusFilter(event.target.value)}
            aria-label="Filtrar por status do disparo"
          >
            {dispatchStatusOptions.map((option) => (
              <option key={option.value || 'all-dispatch-status'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <label className="vacancy-filter-select">
          <LuCalendarCheck size={16} />
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filtrar por data"
          >
            <option value="">Todas as datas</option>
            {dateOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <button
          type="button"
          className="vacancy-filter-button"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          <LuRefreshCw size={16} />
          Limpar filtros
        </button>
      </section>

      <section className="idle-slots-main-grid">
        <section className="idle-slots-right">
          <div className="generated-slots-card">
            <div className="generated-slots-card__header">
              <div>
                <LuCalendarCheck size={22} />
                <h2>Vagas Remanescentes</h2>
              </div>
            </div>

            <div className="generated-slots-table-wrapper">
              <table className="generated-slots-table">
                <thead>
                  <tr>
                    <th>HORÁRIO</th>
                    <th>ESPECIALIDADE <br />/ PROFISSIONAL</th>
                    <th>FILA</th>
                    <th>STATUS DA VAGA</th>
                    <th>DISPARO</th>
                    <th>EXPIRAÇÃO</th>
                    <th>PACIENTE</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSlots.length > 0 ? (
                    filteredSlots.map((slot) => {
                      const action = getSlotAction(slot);

                      return (
                        <tr key={slot.id}>
                          <td>
                            <strong>{slot.time}</strong>
                            <span>{slot.date}</span>
                          </td>

                          <td>
                            <strong>{slot.specialty}</strong>
                            <span>{slot.professional}</span>
                          </td>

                          <td>
                            <div className="queue-patients">
                              <LuUsers size={15} />
                              <strong>{slot.queuePatients}</strong>
                              <span>
                                {slot.queuePatients === 1 ? 'paciente' : 'pacientes'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`slot-status slot-status--${slot.vacancyStatus}`}
                            >
                              {slot.vacancyStatusText}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`slot-status slot-status--${slot.dispatchStatus}`}
                            >
                              {slot.dispatchStatusText}
                            </span>
                          </td>

                          <td>
                            <span className="slot-expiration">
                              {slot.expiration}
                            </span>
                          </td>

                          <td>
                            {slot.confirmedPatient ? (
                              <strong className="confirmed-patient">
                                {slot.confirmedPatient}
                              </strong>
                            ) : (
                              <span className="empty-patient">—</span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`slot-action slot-action--${action.variant}`}
                              disabled={Boolean(action.disabled)}
                              onClick={() => handleSlotAction(slot)}
                            >
                              {action.label}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="generated-slots-empty-row">
                      <td colSpan="8">
                        <div className="generated-slots-empty">
                          <strong>Nenhuma vaga encontrada</strong>
                          <span>Tente ajustar ou limpar os filtros aplicados.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      {queueModalSlot ? (
        <div
          className="vacancy-modal-overlay"
          role="presentation"
          onClick={() => setQueueModalSlot(null)}
        >
          <div
            className="vacancy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="queue-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="vacancy-modal__eyebrow">Fila da especialidade</span>
            <h2 id="queue-modal-title">Fila da especialidade</h2>

            <div className="vacancy-modal__content">
              <article className="vacancy-modal__field">
                <span>Especialidade</span>
                <strong>{queueModalSlot.specialty}</strong>
              </article>

              <article className="vacancy-modal__field">
                <span>Mensagem</span>
                <p>Nenhum paciente elegível encontrado para esta especialidade.</p>
              </article>

              <article className="vacancy-modal__field">
                <span>Orientação</span>
                <p>
                  Cadastre pacientes ou atualize os interesses na Gestão de Pacientes.
                </p>
              </article>
            </div>

            <button
              type="button"
              className="vacancy-modal__button"
              onClick={() => setQueueModalSlot(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
