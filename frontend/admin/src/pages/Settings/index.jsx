import {
  LuBadgeAlert,
  LuBuilding2,
  LuClock3,
  LuFileText,
  LuShieldCheck,
} from 'react-icons/lu';
import './styles.css';

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

export default function Settings() {
  return (
    <main className="settings-page">
      <section className="settings-header">
        <div>
          <h1>Configurações</h1>
          <p>Consulte o status atual dos parâmetros operacionais do painel.</p>

          <div className="settings-pill-row">
            <span className="settings-pill">Operacional</span>
            <span className="settings-pill">Mensageria</span>
            <span className="settings-pill">Governança</span>
          </div>
        </div>
      </section>

      <div
        className="settings-feedback-banner settings-feedback-banner--warning"
        role="status"
      >
        <LuBadgeAlert size={16} />
        <span>
          Esta tela está em modo informativo. Algumas configurações
          operacionais ainda dependem de suporte futuro no backend.
        </span>
      </div>

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
              Essa regra segue a automação atual do sistema e ainda não pode
              ser configurada por esta tela administrativa.
            </p>
          </div>

          <div className="settings-card__metric">
            <span>Status</span>
            <strong>Planejado</strong>
          </div>

          <p className="settings-card__note">
            Aguardando suporte do backend para edição administrativa.
          </p>
        </article>

        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuFileText size={20} />
            </div>
            <span className="settings-card__badge">Mensageria</span>
          </div>

          <div className="settings-card__content">
            <h2>Mensagem padrão de oferta de vaga</h2>
            <p>
              O texto de oferta ainda é definido no backend e não pode ser
              alterado pelo admin no painel.
            </p>
          </div>

          <div className="settings-template-preview">
            <span>Status atual</span>
            <p>
              Template definido no backend. Configuração administrativa
              prevista para etapa futura.
            </p>
          </div>

          <p className="settings-card__note">
            Quando houver suporte real, esta seção poderá receber edição.
          </p>
        </article>

        <article className="settings-card">
          <div className="settings-card__top">
            <div className="settings-card__icon">
              <LuBuilding2 size={20} />
            </div>
            <span className="settings-card__badge">Institucional</span>
          </div>

          <div className="settings-card__content">
            <h2>Dados da unidade</h2>
            <p>Informações institucionais exibidas no painel administrativo.</p>
          </div>

          <dl className="settings-unit-list">
            {unitDetails.map((detail) => (
              <div key={detail.label} className="settings-unit-item">
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>

          <p className="settings-card__note">
            Exibição informativa, sem edição por esta tela.
          </p>
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
              Recursos de auditoria e rastreabilidade previstos para evolução
              futura do painel.
            </p>
          </div>

          <div className="settings-template-preview">
            <span>Status atual</span>
            <p>
              Recursos de auditoria e rastreabilidade previstos para evolução
              futura.
            </p>
          </div>

          <p className="settings-card__note">
            Não há configuração administrativa ativa nesta seção no momento.
          </p>
        </article>
      </section>
    </main>
  );
}
