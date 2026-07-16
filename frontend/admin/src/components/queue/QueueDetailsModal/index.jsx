import QueueModalShell from '../QueueModalShell';

export default function QueueDetailsModal({
  queueRequest,
  onClose,
  onEdit,
}) {
  if (!queueRequest) {
    return null;
  }

  return (
    <QueueModalShell
      title="Detalhes da solicitação"
      description="Acompanhe as informações principais do paciente e as vagas compatíveis encontradas."
      className="queue-modal--details"
      onClose={onClose}
    >
      <div className="queue-details">
        <header className="queue-details__hero">
          <div>
            <span className="queue-details__eyebrow">Fila Inteligente</span>
            <h4>{queueRequest.patientName}</h4>
            <p>{queueRequest.specialtyName}</p>
          </div>

          <span className={`queue-status-badge queue-status-badge--${queueRequest.status}`}>
            {queueRequest.statusLabel}
          </span>
        </header>

        <section className="queue-details__grid">
          <article className="queue-details__field">
            <span>Paciente</span>
            <strong>{queueRequest.patientName}</strong>
          </article>

          <article className="queue-details__field">
            <span>CPF</span>
            <strong>{queueRequest.patientCpfFormatted || 'Não informado'}</strong>
          </article>

          <article className="queue-details__field">
            <span>Telefone</span>
            <strong>{queueRequest.patientPhoneFormatted || 'Não informado'}</strong>
          </article>

          <article className="queue-details__field">
            <span>E-mail</span>
            <strong>{queueRequest.patientEmail}</strong>
          </article>

          <article className="queue-details__field">
            <span>Especialidade desejada</span>
            <strong>{queueRequest.specialtyName}</strong>
          </article>

          <article className="queue-details__field">
            <span>Profissional preferido</span>
            <strong>{queueRequest.professionalName}</strong>
          </article>

          <article className="queue-details__field">
            <span>Status da solicitação</span>
            <strong>{queueRequest.statusLabel}</strong>
          </article>

          <article className="queue-details__field">
            <span>Entrada na fila</span>
            <strong>{queueRequest.createdAtDateTime}</strong>
          </article>

          <article className="queue-details__field">
            <span>Última atualização</span>
            <strong>{queueRequest.updatedAtDateTime}</strong>
          </article>
        </section>

        <section className="queue-details__matches">
          <div className="queue-details__matches-header">
            <div>
              <h5>Vagas compatíveis encontradas</h5>
              <p>
                {queueRequest.compatibleVacanciesCount === 1
                  ? '1 vaga aberta combina com esta solicitação.'
                  : `${queueRequest.compatibleVacanciesCount} vagas abertas combinam com esta solicitação.`}
              </p>
            </div>
          </div>

          <div className="queue-details__matches-list">
            {queueRequest.compatibleVacancies.length > 0 ? (
              queueRequest.compatibleVacancies.map((vacancy) => (
                <article key={vacancy.id} className="queue-details__match-card">
                  <div>
                    <strong>{vacancy.specialty}</strong>
                    <span>{vacancy.professional}</span>
                  </div>

                  <div>
                    <strong>{vacancy.dateTime}</strong>
                    <span className="queue-details__match-status">
                      Status: {vacancy.statusLabel}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <article className="queue-details__match-card queue-details__match-card--empty">
                <strong>Nenhuma vaga compatível encontrada no momento.</strong>
                <span>
                  Quando uma vaga aberta atender a especialidade e o profissional desejado,
                  ela aparecerá aqui.
                </span>
              </article>
            )}
          </div>

          {/* TODO: Quando o fluxo de Match estiver disponível no admin, exibir aqui as ações reais de oferta e acompanhamento da vaga. */}
        </section>

        <footer className="queue-details__actions">
          <button
            type="button"
            className="queue-details__secondary-button"
            onClick={onClose}
          >
            Fechar
          </button>

          <button
            type="button"
            className="queue-details__primary-button"
            onClick={onEdit}
          >
            Editar solicitação
          </button>
        </footer>
      </div>
    </QueueModalShell>
  );
}
