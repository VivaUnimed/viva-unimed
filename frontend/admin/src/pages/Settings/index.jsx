import { useEffect, useState } from 'react';
import {
  LuBadgeCheck,
  LuBuilding2,
  LuClock3,
  LuFileText,
  LuPencilLine,
  LuShieldCheck,
  LuX,
} from 'react-icons/lu';
import './styles.css';

const messageTemplateFields = [
  'Especialidade',
  'Profissional',
  'Horário',
  'Instrução de aceite',
];

const unitDetails = [
  {
    label: 'Unidade',
    value: 'Unimed Litoral Sul/RS',
  },
  {
    label: 'Cidade',
    value: 'Rio Grande/RS',
  },
];

const securityTopics = [
  'Controle de acesso por perfil administrativo',
  'Registro de ações relevantes',
  'Proteção de dados conforme LGPD',
];

const expirationOptions = [
  '5 minutos',
  '10 minutos',
  '15 minutos',
  '30 minutos',
  '45 minutos',
  '60 minutos',
];

const templateVariables = [
  '{paciente}',
  '{especialidade}',
  '{profissional}',
  '{horario}',
  '{instrucao_aceite}',
];

const initialMessageTemplate = 'Olá, {paciente}. Surgiu uma vaga para {especialidade} com {profissional} às {horario}. Responda para confirmar seu interesse.';

function SettingsModal({
  title,
  description,
  dialogId,
  descriptionId,
  onClose,
  children,
}) {
  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal__header">
          <div>
            <h3 id={dialogId}>{title}</h3>
            <p id={descriptionId}>{description}</p>
          </div>

          <button
            type="button"
            className="settings-modal__close"
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

export default function Settings() {
  const [expirationTime, setExpirationTime] = useState('15 minutos');
  const [messageTemplate, setMessageTemplate] = useState(initialMessageTemplate);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [expirationDraft, setExpirationDraft] = useState('15 minutos');
  const [templateDraft, setTemplateDraft] = useState(initialMessageTemplate);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!activeModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveModal(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  const handleOpenExpirationModal = () => {
    setExpirationDraft(expirationTime);
    setActiveModal('expiration');
  };

  const handleOpenTemplateModal = () => {
    setTemplateDraft(messageTemplate);
    setActiveModal('template');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSaveExpiration = (event) => {
    event.preventDefault();
    setExpirationTime(expirationDraft);
    setSuccessMessage('Tempo de expiração atualizado com sucesso.');
    handleCloseModal();
  };

  const handleSaveTemplate = (event) => {
    event.preventDefault();
    setMessageTemplate(templateDraft.trim() || initialMessageTemplate);
    setSuccessMessage('Template atualizado com sucesso.');
    handleCloseModal();
  };

  return (
    <main className="settings-page">
      <section className="settings-header">
        <div>
          <h1>Configurações</h1>
          <p>Gerencie parâmetros operacionais do sistema.</p>

          <div className="settings-pill-row">
            <span className="settings-pill">Operacional</span>
            <span className="settings-pill">Mensageria</span>
            <span className="settings-pill">Segurança</span>
          </div>
        </div>
      </section>

      {successMessage ? (
        <div className="settings-feedback-banner" role="status">
          <LuBadgeCheck size={16} />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <section className="settings-grid">
        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuClock3 size={20} />
            </div>
            <span className="settings-card__badge">Fluxo de vagas</span>
          </div>

          <div className="settings-card__content">
            <h2>Tempo padrão de expiração da vaga</h2>
            <p>
              Tempo máximo para aceite antes da vaga expirar automaticamente.
            </p>
          </div>

          <div className="settings-card__metric">
            <span>Valor atual</span>
            <strong>{expirationTime}</strong>
          </div>

          <button
            type="button"
            className="settings-card__action"
            onClick={handleOpenExpirationModal}
          >
            <LuPencilLine size={16} />
            Editar
          </button>
        </article>

        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuFileText size={20} />
            </div>
            <span className="settings-card__badge">WhatsApp</span>
          </div>

          <div className="settings-card__content">
            <h2>Mensagem padrão de oferta de vaga</h2>
            <p>
              Template usado para informar especialidade, profissional, horário
              e instrução de aceite.
            </p>
          </div>

          <div className="settings-tag-list" aria-label="Campos do template">
            {messageTemplateFields.map((field) => (
              <span key={field} className="settings-tag">
                {field}
              </span>
            ))}
          </div>

          <div className="settings-template-preview">
            <span>Prévia atual</span>
            <p>{messageTemplate}</p>
          </div>

          <button
            type="button"
            className="settings-card__action"
            onClick={handleOpenTemplateModal}
          >
            <LuPencilLine size={16} />
            Editar template
          </button>
        </article>

        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuBuilding2 size={20} />
            </div>
            <span className="settings-card__badge">Painel administrativo</span>
          </div>

          <div className="settings-card__content">
            <h2>Dados da unidade</h2>
            <p>Dados operacionais exibidos no painel administrativo.</p>
          </div>

          <dl className="settings-unit-list">
            {unitDetails.map((detail) => (
              <div key={detail.label} className="settings-unit-item">
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuShieldCheck size={20} />
            </div>
            <span className="settings-card__badge">Governança</span>
          </div>

          <div className="settings-card__content">
            <h2>Segurança e auditoria</h2>
            <p>
              Camadas previstas para rastreabilidade, acesso administrativo e
              conformidade operacional.
            </p>
          </div>

          <ul className="settings-audit-list">
            {securityTopics.map((topic) => (
              <li key={topic} className="settings-audit-item">
                <LuBadgeCheck size={18} />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {activeModal === 'expiration' ? (
        <SettingsModal
          title="Editar tempo de expiração"
          description="Defina o tempo máximo para o paciente aceitar uma vaga antes dela expirar automaticamente."
          dialogId="settings-expiration-modal-title"
          descriptionId="settings-expiration-modal-description"
          onClose={handleCloseModal}
        >
          <form className="settings-form" onSubmit={handleSaveExpiration}>
            <label className="settings-form__field">
              <span>Tempo de expiração</span>
              <select
                value={expirationDraft}
                onChange={(event) => setExpirationDraft(event.target.value)}
              >
                {expirationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="settings-form__actions">
              <button
                type="button"
                className="settings-form__button settings-form__button--secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="settings-form__button settings-form__button--primary"
              >
                Salvar alteração
              </button>
            </div>
          </form>
        </SettingsModal>
      ) : null}

      {activeModal === 'template' ? (
        <SettingsModal
          title="Editar template de mensagem"
          description="Configure a mensagem usada para avisar pacientes sobre vagas remanescentes."
          dialogId="settings-template-modal-title"
          descriptionId="settings-template-modal-description"
          onClose={handleCloseModal}
        >
          <form className="settings-form" onSubmit={handleSaveTemplate}>
            <label className="settings-form__field">
              <span>Mensagem</span>
              <textarea
                value={templateDraft}
                onChange={(event) => setTemplateDraft(event.target.value)}
                rows={5}
              />
            </label>

            <div className="settings-form__variables">
              <span>Variáveis disponíveis</span>

              <div className="settings-form__variables-list">
                {templateVariables.map((variable) => (
                  <span key={variable} className="settings-form__variable">
                    {variable}
                  </span>
                ))}
              </div>
            </div>

            <div className="settings-form__actions">
              <button
                type="button"
                className="settings-form__button settings-form__button--secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="settings-form__button settings-form__button--primary"
              >
                Salvar template
              </button>
            </div>
          </form>
        </SettingsModal>
      ) : null}
    </main>
  );
}
