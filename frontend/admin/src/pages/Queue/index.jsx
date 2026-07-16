import { useEffect, useState } from 'react';
import {
  LuBadgeAlert,
  LuBadgeCheck,
  LuChevronDown,
  LuCircleX,
  LuClock3,
  LuClipboardList,
  LuPlus,
  LuSearch,
  LuSlidersHorizontal,
  LuUsers,
} from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router-dom';
import QueueRequestModal from '../../components/queue/QueueRequestModal';
import {
  normalizeText,
  queueStatusOptions,
} from '../../data/queue';
import { useQueue } from '../../context/queueContext/queueContext';
import './styles.css';

const summaryCards = [
  {
    id: 'total',
    label: 'Total na fila',
    icon: LuUsers,
    modifier: 'total',
    valueKey: 'total',
  },
  {
    id: 'waiting',
    label: 'Aguardando vaga',
    icon: LuClock3,
    modifier: 'waiting',
    valueKey: 'waiting',
  },
  {
    id: 'with-compatible',
    label: 'Com vaga compatível',
    icon: LuBadgeCheck,
    modifier: 'positive',
    valueKey: 'withCompatibleVacancy',
  },
  {
    id: 'without-compatible',
    label: 'Sem vaga compatível',
    icon: LuBadgeAlert,
    modifier: 'warning',
    valueKey: 'withoutCompatibleVacancy',
  },
  {
    id: 'cancelled',
    label: 'Cancelados',
    icon: LuCircleX,
    modifier: 'cancelled',
    valueKey: 'cancelled',
  },
];

const formatSummaryValue = (value) => String(value).padStart(2, '0');

export default function Queue() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    queueRequestItems,
    summary,
    patients,
    specialties,
    professionals,
    createQueueRequest,
  } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [professionalFilter, setProfessionalFilter] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(
    () => location.state?.successMessage ?? '',
  );
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [createdAtPreview, setCreatedAtPreview] = useState(() => new Date().toISOString());
  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(
    normalizedSearchTerm
    || statusFilter
    || specialtyFilter
    || professionalFilter,
  );

  const filteredQueueRequests = queueRequestItems.filter((queueRequest) => {
    const matchesSearch = !normalizedSearchTerm || [
      queueRequest.patientName,
      queueRequest.patientCpf,
      queueRequest.patientCpfFormatted,
      queueRequest.specialtyName,
      queueRequest.professionalName,
    ].some((value) => normalizeText(value).includes(normalizedSearchTerm));

    const matchesStatus = !statusFilter || queueRequest.status === statusFilter;
    const matchesSpecialty = !specialtyFilter
      || String(queueRequest.specialityId) === String(specialtyFilter);
    const matchesProfessional = !professionalFilter
      || String(queueRequest.doctorId ?? '') === String(professionalFilter);

    return (
      matchesSearch
      && matchesStatus
      && matchesSpecialty
      && matchesProfessional
    );
  });

  const openCreateModal = () => {
    setCreatedAtPreview(new Date().toISOString());
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
  };

  const handleSaveRequest = (formValues) => {
    createQueueRequest(formValues);
    setFeedbackMessage('Paciente adicionado à fila com sucesso.');
    closeRequestModal();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSpecialtyFilter('');
    setProfessionalFilter('');
  };

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

  return (
    <main className="queue-page">
      <section className="queue-header">
        <div>
          <h1>Fila Inteligente</h1>
          <p>
            Gerencie os pacientes que aguardam vagas compatíveis por especialidade
            e profissional.
          </p>
        </div>

        <button
          type="button"
          className="queue-header__button"
          onClick={openCreateModal}
        >
          <LuPlus size={18} />
          Adicionar à fila
        </button>
      </section>

      {feedbackMessage ? (
        <div className="queue-feedback-banner" role="status">
          <LuBadgeCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      <section className="queue-stats">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.id}
              className={`queue-stat-card queue-stat-card--${card.modifier}`}
            >
              <div>
                <span>{card.label}</span>
                <strong>{formatSummaryValue(summary[card.valueKey])}</strong>
              </div>

              <div className="queue-stat-card__icon">
                <Icon size={20} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="queue-filters">
        <div className="queue-filters__search">
          <LuSearch size={18} />
          <input
            type="search"
            placeholder="Buscar por paciente, CPF, especialidade ou profissional..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <label className="queue-filter-select">
          <LuSlidersHorizontal size={16} />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por status"
          >
            {queueStatusOptions.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <label className="queue-filter-select">
          <LuClipboardList size={16} />
          <select
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
            aria-label="Filtrar por especialidade"
          >
            <option value="">Todas as especialidades</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <label className="queue-filter-select">
          <LuUsers size={16} />
          <select
            value={professionalFilter}
            onChange={(event) => setProfessionalFilter(event.target.value)}
            aria-label="Filtrar por profissional"
          >
            <option value="">Todos os profissionais</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} />
        </label>

        <button
          type="button"
          className="queue-filters__clear"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          Limpar filtros
        </button>
      </section>

      <section className="queue-table-card">
        <div className="queue-table-card__header">
          <div>
            <LuClipboardList size={22} />
            <div>
              <h2>Solicitações da fila</h2>
              <p>
                {queueRequestItems.length === 1
                  ? '1 solicitação visível nesta etapa do fluxo.'
                  : `${queueRequestItems.length} solicitações visíveis nesta etapa do fluxo.`}
              </p>
            </div>
          </div>
        </div>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Interesse</th>
                <th>Entrada na fila</th>
                <th>Status</th>
                <th>Vagas compatíveis</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredQueueRequests.length > 0 ? (
                filteredQueueRequests.map((queueRequest) => (
                  <tr key={queueRequest.id}>
                    <td>
                      <strong>{queueRequest.patientName}</strong>
                      <span>
                        CPF: {queueRequest.patientCpfFormatted || 'Não informado'}
                      </span>
                    </td>

                    <td>
                      <strong>{queueRequest.specialtyName}</strong>
                      <span>{queueRequest.professionalName}</span>
                    </td>

                    <td>
                      <strong>{queueRequest.createdAtDate}</strong>
                      <span>{queueRequest.createdAtTime}</span>
                    </td>

                    <td>
                      <span className={`queue-status-badge queue-status-badge--${queueRequest.status}`}>
                        {queueRequest.statusLabel}
                      </span>
                    </td>

                    <td>
                      <div
                        className={`queue-compatibility queue-compatibility--${queueRequest.compatibleVacanciesCount > 0 ? 'positive' : 'empty'}`}
                      >
                        <strong>{queueRequest.compatibleVacanciesCount}</strong>
                        <span>{queueRequest.compatibleVacanciesText}</span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="queue-table__action queue-table__action--primary"
                        onClick={() => navigate(`/queue/${queueRequest.id}`)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="queue-table__empty">
                    <strong>Nenhuma solicitação encontrada</strong>
                    <span>
                      {hasActiveFilters
                        ? 'Ajuste os filtros para visualizar outras solicitações.'
                        : 'Adicione uma nova solicitação para visualizar o fluxo da fila.'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isRequestModalOpen ? (
        <QueueRequestModal
          mode="create"
          queueRequest={null}
          patients={patients}
          specialties={specialties}
          professionals={professionals}
          createdAtPreview={createdAtPreview}
          onClose={closeRequestModal}
          onSave={handleSaveRequest}
        />
      ) : null}
    </main>
  );
}
