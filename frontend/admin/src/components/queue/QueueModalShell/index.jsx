import { LuX } from 'react-icons/lu';

export default function QueueModalShell({
  title,
  description,
  className = '',
  onClose,
  children,
}) {
  return (
    <div className="queue-modal-backdrop" onClick={onClose}>
      <section
        className={`queue-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="queue-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="queue-modal__header">
          <div>
            <h3 id="queue-modal-title">{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>

          <button
            type="button"
            className="queue-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <LuX size={18} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}
