import QueueModalShell from '../QueueModalShell';

export default function QueueConfirmRemoveModal({
  queueRequest,
  errorMessage = '',
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  if (!queueRequest) {
    return null;
  }

  return (
    <QueueModalShell
      title="Remover da fila"
      description="Essa ação cancelará a solicitação de espera."
      className="queue-modal--confirm"
      onClose={onClose}
    >
      <div className="queue-confirm-remove">
        {errorMessage ? (
          <div className="queue-form__error" role="alert">
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <p>
          Tem certeza que deseja remover este paciente da fila?
        </p>

        <strong>{queueRequest.patientName}</strong>

        <div className="queue-confirm-remove__actions">
          <button
            type="button"
            className="queue-confirm-remove__cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="queue-confirm-remove__submit"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Removendo...' : 'Remover da fila'}
          </button>
        </div>
      </div>
    </QueueModalShell>
  );
}
