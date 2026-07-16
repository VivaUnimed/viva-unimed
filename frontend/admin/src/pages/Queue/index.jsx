import { useState } from 'react';
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
import QueueConfirmRemoveModal from '../../components/queue/QueueConfirmRemoveModal';
import QueueDetailsModal from '../../components/queue/QueueDetailsModal';
import QueueRequestModal from '../../components/queue/QueueRequestModal';
import {
  buildQueueRequestList,
  buildQueueSummary,
  createLookupById,
  normalizeText,
  queueStatusOptions,
} from '../../data/queue';
import {
  createInitialQueueRequests,
  queuePatientsMock,
  queueProfessionalsMock,
  queueRequestsMock,
  queueSpecialtiesMock,
  queueVacanciesMock,
} from '../../mocks/queueMock';
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
  const [queueRequests, setQueueRequests] = useState(() => createInitialQueueRequests());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [professionalFilter, setProfessionalFilter] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalMode, setRequestModalMode] = useState('create');
  const [requestEditingId, setRequestEditingId] = useState(null);
  const [requestDetailsId, setRequestDetailsId] = useState(null);
  const [requestPendingRemoveId, setRequestPendingRemoveId] = useState(null);
  const [createdAtPreview, setCreatedAtPreview] = useState(() => new Date().toISOString());

  const patientsById = createLookupById(queuePatientsMock);
  const professionalsById = createLookupById(queueProfessionalsMock);
  const specialtiesById = createLookupById(queueSpecialtiesMock);

  const queueRequestItems = buildQueueRequestList(queueRequests, {
    patientsById,
    professionalsById,
    specialtiesById,
    vacancies: queueVacanciesMock,
  });
  const summary = buildQueueSummary(queueRequestItems);
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

  const editingQueueRequest = queueRequestItems.find(
    (queueRequest) => queueRequest.id === requestEditingId,
  ) ?? null;
  const detailsQueueRequest = queueRequestItems.find(
    (queueRequest) => queueRequest.id === requestDetailsId,
  ) ?? null;
  const queueRequestPendingRemove = queueRequestItems.find(
    (queueRequest) => queueRequest.id === requestPendingRemoveId,
  ) ?? null;

  const openCreateModal = () => {
    setCreatedAtPreview(new Date().toISOString());
    setRequestModalMode('create');
    setRequestEditingId(null);
    setIsRequestModalOpen(true);
  };

  const openEditModal = (queueRequestId) => {
    setRequestModalMode('edit');
    setRequestEditingId(queueRequestId);
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setRequestEditingId(null);
  };

  const closeDetailsModal = () => {
    setRequestDetailsId(null);
  };

  const closeRemoveModal = () => {
    setRequestPendingRemoveId(null);
  };

  const handleSaveRequest = (formValues) => {
    if (requestModalMode === 'edit' && requestEditingId) {
      setQueueRequests((currentQueueRequests) => (
        currentQueueRequests.map((queueRequest) => (
          queueRequest.id === requestEditingId
            ? {
              ...queueRequest,
              specialityId: formValues.specialityId,
              doctorId: formValues.doctorId,
              status: formValues.status,
              updatedAt: new Date().toISOString(),
            }
            : queueRequest
        ))
      ));
      setFeedbackMessage('Solicitação atualizada com sucesso.');
      closeRequestModal();
      closeDetailsModal();
      return;
    }

    const nextId = queueRequestsMock.reduce(
      (highestId, queueRequest) => Math.max(highestId, Number(queueRequest.id) || 0),
      0,
    );
    const currentHighestId = queueRequests.reduce(
      (highestId, queueRequest) => Math.max(highestId, Number(queueRequest.id) || 0),
      nextId,
    );
    const requestTimestamp = formValues.createdAt || new Date().toISOString();

    setQueueRequests((currentQueueRequests) => ([
      {
        id: currentHighestId + 1,
        patientId: formValues.patientId,
        specialityId: formValues.specialityId,
        doctorId: formValues.doctorId,
        status: 'waiting',
        createdAt: requestTimestamp,
        updatedAt: requestTimestamp,
      },
      ...currentQueueRequests,
    ]));
    setFeedbackMessage('Paciente adicionado à fila com sucesso.');
    closeRequestModal();
  };

  const handleConfirmRemove = () => {
    if (!requestPendingRemoveId) {
      return;
    }

    setQueueRequests((currentQueueRequests) => (
      currentQueueRequests.map((queueRequest) => (
        queueRequest.id === requestPendingRemoveId
          ? {
            ...queueRequest,
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          }
          : queueRequest
      ))
    ));
    setFeedbackMessage('Solicitação cancelada e mantida no histórico da fila.');
    closeRemoveModal();
    closeDetailsModal();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSpecialtyFilter('');
    setProfessionalFilter('');
  };

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
            {queueSpecialtiesMock.map((specialty) => (
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
            {queueProfessionalsMock.map((professional) => (
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
                        onClick={() => setRequestDetailsId(queueRequest.id)}
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
          mode={requestModalMode}
          queueRequest={editingQueueRequest}
          patients={queuePatientsMock}
          specialties={queueSpecialtiesMock}
          professionals={queueProfessionalsMock}
          createdAtPreview={createdAtPreview}
          onClose={closeRequestModal}
          onSave={handleSaveRequest}
        />
      ) : null}

      {detailsQueueRequest ? (
        <QueueDetailsModal
          queueRequest={detailsQueueRequest}
          onClose={closeDetailsModal}
          onEdit={() => {
            closeDetailsModal();
            openEditModal(detailsQueueRequest.id);
          }}
          onRemove={() => {
            closeDetailsModal();
            setRequestPendingRemoveId(detailsQueueRequest.id);
          }}
        />
      ) : null}

      {queueRequestPendingRemove ? (
        <QueueConfirmRemoveModal
          queueRequest={queueRequestPendingRemove}
          onClose={closeRemoveModal}
          onConfirm={handleConfirmRemove}
        />
      ) : null}
    </main>
  );
}
