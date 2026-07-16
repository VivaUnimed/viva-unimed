import { useState } from 'react';
import {
  LuBadgeCheck,
  LuCalendarCheck,
  LuChevronLeft,
  LuClipboardList,
  LuClock3,
  LuPencilLine,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import QueueConfirmRemoveModal from '../../components/queue/QueueConfirmRemoveModal';
import QueueRequestModal from '../../components/queue/QueueRequestModal';
import { useQueue } from '../../context/queueContext/queueContext';
import '../Queue/styles.css';
import './styles.css';

function getPageCopy(queueRequest) {
  if (queueRequest.status === 'approved') {
    return {
      eyebrow: 'Solicitação aprovada',
      description: 'A solicitação foi atendida e permanece visível para acompanhamento.',
      highlightTitle: 'Atendimento encaminhado',
      highlightDescription:
        'Esta solicitação já recebeu aprovação no fluxo da fila inteligente.',
      highlightModifier: 'positive',
    };
  }

  if (queueRequest.status === 'cancelled') {
    return {
      eyebrow: 'Solicitação encerrada',
      description: 'A solicitação foi cancelada e segue disponível para consulta.',
      highlightTitle: 'Solicitação cancelada',
      highlightDescription:
        'O paciente não está mais aguardando uma vaga nesta solicitação.',
      highlightModifier: 'neutral',
    };
  }

  if (queueRequest.status === 'expired') {
    return {
      eyebrow: 'Solicitação encerrada',
      description: 'A solicitação expirou e permanece disponível apenas para histórico.',
      highlightTitle: 'Prazo encerrado',
      highlightDescription:
        'Esta solicitação não está mais participando da fila no momento.',
      highlightModifier: 'warning',
    };
  }

  if (queueRequest.status === 'rejected') {
    return {
      eyebrow: 'Solicitação encerrada',
      description: 'A solicitação foi recusada e permanece disponível para consulta.',
      highlightTitle: 'Solicitação recusada',
      highlightDescription:
        'O paciente não está mais aguardando uma vaga nesta solicitação.',
      highlightModifier: 'danger',
    };
  }

  return {
    eyebrow: 'Fila Inteligente',
    description: 'Acompanhe as informações principais do paciente e as vagas compatíveis encontradas.',
    highlightTitle:
      queueRequest.compatibleVacanciesCount > 0
        ? 'Vagas compatíveis disponíveis'
        : 'Aguardando vaga compatível',
    highlightDescription:
      queueRequest.compatibleVacanciesCount > 0
        ? queueRequest.compatibleVacanciesCount === 1
          ? 'Existe 1 vaga aberta compatível com esta solicitação.'
          : `Existem ${queueRequest.compatibleVacanciesCount} vagas abertas compatíveis com esta solicitação.`
        : 'No momento, não há vagas abertas compatíveis com esta solicitação.',
    highlightModifier: 'active',
  };
}

function getDetailsFields(queueRequest) {
  return [
    {
      label: 'Paciente',
      value: queueRequest.patientName,
    },
    {
      label: 'CPF',
      value: queueRequest.patientCpfFormatted || 'Não informado',
    },
    {
      label: 'Telefone',
      value: queueRequest.patientPhoneFormatted || 'Não informado',
    },
    {
      label: 'E-mail',
      value: queueRequest.patientEmail,
    },
    {
      label: 'Especialidade desejada',
      value: queueRequest.specialtyName,
    },
    {
      label: 'Profissional preferido',
      value: queueRequest.professionalName,
    },
    {
      label: 'Status da solicitação',
      value: queueRequest.statusLabel,
      badgeModifier: queueRequest.status,
      icon: LuClock3,
    },
    {
      label: 'Entrada na fila',
      value: queueRequest.createdAtDateTime,
      icon: LuCalendarCheck,
    },
    {
      label: 'Última atualização',
      value: queueRequest.updatedAtDateTime,
      icon: LuClipboardList,
    },
  ];
}

export default function QueueDetails() {
  const navigate = useNavigate();
  const { queueRequestId } = useParams();
  const {
    getQueueRequestById,
    updateQueueRequest,
    cancelQueueRequest,
    specialties,
    professionals,
  } = useQueue();
  const [pageMessage, setPageMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const queueRequest = getQueueRequestById(queueRequestId);

  if (!queueRequest) {
    return (
      <main className="queue-request-details-page">
        <section className="queue-request-details-header">
          <button
            type="button"
            className="queue-request-details-back-button"
            onClick={() => navigate('/queue')}
          >
            <LuChevronLeft size={18} />
            Voltar para fila
          </button>
        </section>

        <section className="queue-request-details-card queue-request-details-card--empty">
          <span className="queue-request-details-eyebrow">Fila Inteligente</span>
          <h1>Solicitação não encontrada.</h1>
          <p>A solicitação informada não foi localizada na fila atual.</p>

          <button
            type="button"
            className="queue-request-details-primary-button"
            onClick={() => navigate('/queue')}
          >
            Voltar para fila
          </button>
        </section>
      </main>
    );
  }

  const pageCopy = getPageCopy(queueRequest);
  const detailFields = getDetailsFields(queueRequest);

  const handleEditSave = (formValues) => {
    updateQueueRequest(queueRequest.id, formValues);
    setPageMessage('Solicitação atualizada com sucesso.');
    setIsEditModalOpen(false);
  };

  const handleConfirmRemove = () => {
    cancelQueueRequest(queueRequest.id);
    setIsRemoveModalOpen(false);

    navigate('/queue', {
      state: {
        successMessage: 'Solicitação cancelada e mantida no histórico da fila.',
      },
    });
  };

  return (
    <main className="queue-request-details-page">
      <section className="queue-request-details-header">
        <button
          type="button"
          className="queue-request-details-back-button"
          onClick={() => navigate('/queue')}
        >
          <LuChevronLeft size={18} />
          Voltar para fila
        </button>
      </section>

      <section className="queue-request-details-card">
        {pageMessage ? (
          <div className="queue-request-details-alert" role="status">
            <LuBadgeCheck size={18} />
            <span>{pageMessage}</span>
          </div>
        ) : null}

        <header className="queue-request-details-card__header">
          <div className="queue-request-details-identity">
            <div>
              <span className="queue-request-details-eyebrow">{pageCopy.eyebrow}</span>
              <h1>{queueRequest.patientName}</h1>
              <p>{pageCopy.description}</p>

              <div className="queue-request-details-badges">
                <span className={`queue-status-badge queue-status-badge--${queueRequest.status}`}>
                  {queueRequest.statusLabel}
                </span>
                <span className="queue-request-details-badge queue-request-details-badge--info">
                  <LuUsers size={14} />
                  {queueRequest.compatibleVacanciesCount === 1
                    ? '1 vaga compatível'
                    : `${queueRequest.compatibleVacanciesCount} vagas compatíveis`}
                </span>
              </div>
            </div>
          </div>

          <div className="queue-request-details-actions">
            <button
              type="button"
              className="queue-request-details-edit-button"
              onClick={() => setIsEditModalOpen(true)}
            >
              <LuPencilLine size={16} />
              Editar solicitação
            </button>

            <button
              type="button"
              className="queue-request-details-delete-button"
              onClick={() => setIsRemoveModalOpen(true)}
            >
              <LuTrash2 size={16} />
              Remover da fila
            </button>
          </div>
        </header>

        <section
          className={`queue-request-details-highlight queue-request-details-highlight--${pageCopy.highlightModifier}`}
        >
          <div className="queue-request-details-highlight__icon">
            <LuClipboardList size={22} />
          </div>

          <div>
            <span className="queue-request-details-highlight__label">Resumo</span>
            <strong>{pageCopy.highlightTitle}</strong>
            <p>{pageCopy.highlightDescription}</p>
          </div>
        </section>

        <section className="queue-request-details-grid">
          {detailFields.map((field) => {
            const Icon = field.icon;

            return (
              <article key={field.label} className="queue-request-details-field">
                <span>{field.label}</span>

                <div className="queue-request-details-field__value">
                  {Icon ? <Icon size={16} /> : null}

                  {field.badgeModifier ? (
                    <strong className={`queue-status-badge queue-status-badge--${field.badgeModifier}`}>
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

        <section className="queue-request-details-matches">
          <div className="queue-request-details-matches__header">
            <LuUsers size={18} />
            <div>
              <h2>Vagas compatíveis encontradas</h2>
              <p>
                Veja as vagas abertas que combinam com esta solicitação neste momento.
              </p>
            </div>
          </div>

          <div className="queue-request-details-matches__list">
            {queueRequest.compatibleVacancies.length > 0 ? (
              queueRequest.compatibleVacancies.map((vacancy) => (
                <article key={vacancy.id} className="queue-request-details-match-card">
                  <div>
                    <strong>{vacancy.specialty}</strong>
                    <span>{vacancy.professional}</span>
                  </div>

                  <div>
                    <strong>{vacancy.dateTime}</strong>
                    <span className="queue-request-details-match-card__status">
                      Status: {vacancy.statusLabel}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <article className="queue-request-details-match-card queue-request-details-match-card--empty">
                <strong>Nenhuma vaga compatível encontrada no momento.</strong>
                <span>
                  Quando surgir uma vaga aberta para esta especialidade e profissional,
                  ela aparecerá aqui.
                </span>
              </article>
            )}
          </div>
        </section>

        <footer className="queue-request-details-footer">
          <button
            type="button"
            className="queue-request-details-primary-button"
            onClick={() => navigate('/queue')}
          >
            Voltar para fila
          </button>
        </footer>
      </section>

      {isEditModalOpen ? (
        <QueueRequestModal
          mode="edit"
          queueRequest={queueRequest}
          patients={[]}
          specialties={specialties}
          professionals={professionals}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      ) : null}

      {isRemoveModalOpen ? (
        <QueueConfirmRemoveModal
          queueRequest={queueRequest}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={handleConfirmRemove}
        />
      ) : null}
    </main>
  );
}
