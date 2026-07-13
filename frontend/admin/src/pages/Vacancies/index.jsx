import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LuBadgeAlert,
  LuBadgeCheck,
  LuCalendarCheck,
  LuChevronDown,
  LuCircleCheck,
  LuCircleX,
  LuClock3,
  LuHistory,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuSlidersHorizontal,
  LuUsers,
} from 'react-icons/lu';

import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import {
  normalizeText,
  vacancyStatusOptions,
} from '../../data/vacancies';

import './styles.css';

const summaryCards = [
  {
    id: 1,
    label: 'Abertas',
    icon: LuCalendarCheck,
    modifier: 'open',
    matches: (vacancy) => vacancy.vacancyStatus === 'open',
  },
  {
    id: 2,
    label: 'Reservadas',
    icon: LuCircleCheck,
    modifier: 'booked',
    matches: (vacancy) => vacancy.vacancyStatus === 'booked',
  },
  {
    id: 3,
    label: 'Expiradas',
    icon: LuHistory,
    modifier: 'expired',
    matches: (vacancy) => vacancy.vacancyStatus === 'expired',
  },
  {
    id: 4,
    label: 'Canceladas',
    icon: LuCircleX,
    modifier: 'cancelled',
    matches: (vacancy) => vacancy.vacancyStatus === 'cancelled',
  },
  {
    id: 5,
    label: 'No-show',
    icon: LuClock3,
    modifier: 'no-show',
    matches: (vacancy) => vacancy.vacancyStatus === 'no_show',
  },
  {
    id: 6,
    label: 'Com fila',
    icon: LuUsers,
    modifier: 'queue',
    matches: (vacancy) => vacancy.queuePatients > 0,
  },
];

const formatSummaryValue = (value) => String(value).padStart(2, '0');

export default function Vacancies() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vacancyState, getVacancies } = useVacancies();
  const { vacancies, isLoading, error } = vacancyState;
  const [feedbackMessage, setFeedbackMessage] = useState(
    () => location.state?.successMessage ?? '',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [vacancyStatusFilter, setVacancyStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const hasLoadedVacanciesRef = useRef(false);

  useEffect(() => {
    const routeFeedbackMessage = location.state?.successMessage;

    if (!routeFeedbackMessage) {
      return;
    }

    setFeedbackMessage(routeFeedbackMessage);
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: null,
      },
    );
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (hasLoadedVacanciesRef.current) {
      return;
    }

    hasLoadedVacanciesRef.current = true;

    const loadVacancies = async () => {
      try {
        await getVacancies();
      } catch {
        // O erro de carregamento permanece disponível em vacancyState.error.
      }
    };

    loadVacancies();
  }, [getVacancies]);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(
    normalizedSearchTerm || vacancyStatusFilter || dateFilter,
  );
  const dateOptions = [...new Map(
    vacancies.map((vacancy) => [vacancy.dateKey, vacancy.date]),
  ).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((firstOption, secondOption) => (
      firstOption.value.localeCompare(secondOption.value)
    ));

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch = !normalizedSearchTerm
      || [
        vacancy.specialty,
        vacancy.professional,
        vacancy.createdByLabel,
        String(vacancy.id),
      ].some((value) => normalizeText(value).includes(normalizedSearchTerm));

    const matchesVacancyStatus = !vacancyStatusFilter
      || vacancy.vacancyStatus === vacancyStatusFilter;

    const matchesDate = !dateFilter || vacancy.dateKey === dateFilter;

    return matchesSearch && matchesVacancyStatus && matchesDate;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setVacancyStatusFilter('');
    setDateFilter('');
  };

  const handleRefresh = async () => {
    try {
      await getVacancies();
    } catch {
      // O erro de atualização permanece disponível em vacancyState.error.
    }
  };

  const emptyMessage = isLoading
    ? 'Carregando vagas...'
    : error
      ? 'Não foi possível carregar as vagas no momento.'
      : hasActiveFilters
        ? 'Nenhuma vaga encontrada com os filtros atuais.'
        : 'Nenhuma vaga cadastrada até o momento.';

  return (
    <main className="idle-slots-page">
      <section className="idle-slots-header">
        <div>
          <h1>Vagas</h1>
          <p>
            Gerencie vagas remanescentes usando os dados atuais do backend.
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
          <LuBadgeCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      {error ? (
        <div
          className="vacancy-feedback-banner vacancy-feedback-banner--error"
          role="alert"
        >
          <LuBadgeAlert size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="vacancy-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = vacancies.filter(card.matches).length;

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
            type="search"
            placeholder="Buscar por especialidade, profissional, vaga ou usuário..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <label className="vacancy-filter-select">
          <LuSlidersHorizontal size={16} />
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
          <LuCalendarCheck size={16} />
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filtrar por data"
          >
            <option value="">Todas as datas</option>
            {dateOptions.map((dateOption) => (
              <option key={dateOption.value} value={dateOption.value}>
                {dateOption.label}
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

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <LuRefreshCw size={16} />
                Atualizar
              </button>
            </div>

            <div className="generated-slots-table-wrapper">
              <table className="generated-slots-table">
                <thead>
                  <tr>
                    <th>DATA / HORÁRIO</th>
                    <th>ESPECIALIDADE / PROFISSIONAL</th>
                    <th>FILA COMPATÍVEL</th>
                    <th>STATUS DA VAGA</th>
                    <th>CADASTRO</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVacancies.length > 0 ? (
                    filteredVacancies.map((vacancy) => (
                      <tr key={vacancy.id}>
                        <td>
                          <strong>{vacancy.time}</strong>
                          <span>{vacancy.date}</span>
                        </td>

                        <td>
                          <strong>{vacancy.specialty}</strong>
                          <span>{vacancy.professional}</span>
                        </td>

                        <td>
                          <div className="queue-patients">
                            <LuUsers size={15} />
                            <strong>{vacancy.queuePatients}</strong>
                            <span>
                              {vacancy.queuePatients === 1 ? 'paciente' : 'pacientes'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`slot-status slot-status--${vacancy.vacancyStatus}`}
                          >
                            {vacancy.vacancyStatusText}
                          </span>
                        </td>

                        <td>
                          <strong>Vaga #{vacancy.id}</strong>
                          <span>{vacancy.createdByLabel}</span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="slot-action slot-action--primary"
                            onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="generated-slots-empty-row">
                      <td colSpan="6">
                        <div className="generated-slots-empty">
                          <strong>Nenhuma vaga encontrada</strong>
                          <span>{emptyMessage}</span>
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
    </main>
  );
}
