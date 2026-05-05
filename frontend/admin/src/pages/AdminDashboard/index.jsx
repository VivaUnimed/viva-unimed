import {
  LuCalendarDays,
  LuClipboard,
  LuTriangleAlert,
  LuSquareCheck,
  LuPlus,
  LuChevronDown,
  LuSparkles,
  LuBuilding,
} from 'react-icons/lu';
import './styles.css';

const summaryCards = [
  {
    id: 1,
    title: 'Total de Consultas',
    value: '1.284',
    description: 'Referente ao mês atual',
    icon: LuCalendarDays,
    variant: 'green',
    badge: '+12%',
  },
  {
    id: 2,
    title: 'Vagas Disponíveis',
    value: '42',
    description: 'Disponibilidade imediata',
    icon: LuClipboard,
    variant: 'light-green',
  },
  {
    id: 3,
    title: 'Taxa de No-show',
    value: '8,4%',
    description: 'Absenteísmo consolidado',
    icon: LuTriangleAlert,
    variant: 'red',
    badge: '-3%',
  },
  {
    id: 4,
    title: 'Vagas Preenchidas e hoje',
    value: '156',
    description: 'Meta diária: 180',
    icon: LuSquareCheck,
    variant: 'dark-green',
  },
];

const idleSlots = [
  {
    id: 1,
    name: 'Dra. Helena Martins',
    info: 'Cardiologia • 08:30 - 09:00',
    status: 'CANCELADO HÁ 15M',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    danger: true,
  },
  {
    id: 2,
    name: 'Dr. Marcos Oliveira',
    info: 'Ortopedia • 10:15 - 10:45',
    status: 'SEM AGENDAMENTO',
    avatar:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Dra. Ana Paula',
    info: 'Pediatria • 11:30 - 12:00',
    status: 'NO-SHOW DETECTADO',
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
    danger: true,
  },
];

const priorities = [
  {
    id: 1,
    title: 'Reunião de Alinhamento - Corpo Clínico',
    time: '14:30',
    status: 'green',
  },
  {
    id: 2,
    title: 'Auditoria de Prontuários (Digital)',
    time: '16:00',
    status: 'light',
  },
  {
    id: 3,
    title: 'Atualização de sistema VivaUnimed v2.4',
    time: '22:00',
    status: 'muted',
  },
];

export default function StrategicDashboard() {
  return (
    <main className="strategic-dashboard-page">
      <section className="strategic-dashboard-header">
        <div>
          <h1>Dashboard Estratégico</h1>
          <p>Visão consolidada da operação VivaUnimed em tempo real.</p>
        </div>

        <div className="strategic-dashboard-date">
          <LuCalendarDays size={14} />
          <span>e hoje: 24 de Maio, 2024</span>
        </div>
      </section>

      <section className="strategic-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className={`strategic-summary-card strategic-summary-card--${card.variant}`}
            >
              <div className="strategic-summary-card__top">
                <div className="strategic-summary-card__icon">
                  <Icon size={20} />
                </div>

                {card.badge && (
                  <span className="strategic-summary-card__badge">
                    {card.badge}
                  </span>
                )}
              </div>

              <h2>{card.title}</h2>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </div>
          );
        })}
      </section>

      <section className="strategic-main-grid">
        <div className="absence-history-card">
          <div className="absence-history-card__header">
            <div>
              <h2>Histórico de Faltas</h2>
              <p>Análise de absenteísmo nos últimos 7 dias</p>
            </div>

            <button type="button">
              Semana Atual
              <LuChevronDown size={14} />
            </button>
          </div>

          <div className="absence-chart">
            <div className="absence-chart__line" />
            <div className="absence-chart__line" />
            <div className="absence-chart__line" />

            <div className="absence-chart__labels">
              <span>SEG</span>
              <span>TER</span>
              <span className="active">QUA</span>
              <span>QUI</span>
              <span>SEX</span>
              <span>SAB</span>
              <span>DOM</span>
            </div>
          </div>
        </div>

        <aside className="dashboard-idle-slots-card">
          <div className="dashboard-idle-slots-card__title">
            <LuTriangleAlert size={18} />
            <h2>Vagas Ociosas</h2>
          </div>

          <div className="dashboard-idle-slots-list">
            {idleSlots.map((item) => (
              <div key={item.id} className="dashboard-idle-slot-item">
                <img src={item.avatar} alt={item.name} />

                <div>
                  <strong>{item.name}</strong>
                  <span>{item.info}</span>
                  <small className={item.danger ? 'danger' : ''}>
                    {item.status}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="dashboard-idle-slots-card__button">
            VER TODAS AS OCORRÊNCIAS
          </button>
        </aside>
      </section>

      <section className="strategic-bottom-grid">
        <div className="optimization-card">
          <div className="optimization-card__content">
            <span>DESTAQUE OPERACIONAL</span>

            <h2>
              Otimização de
              <br />
              Agenda em Tempo
              <br />
              Real
            </h2>

            <p>
              Nossa IA identificou 5 janelas de oportunidade para remanejamento
              de pacientes da fila de espera para as vagas ociosas de hoje.
            </p>

            <button type="button">Executar Remanejamento</button>
          </div>

          <div className="optimization-card__icon">
            <LuSparkles size={40} />
          </div>
        </div>

        <div className="priorities-card">
          <h2>Próximas Prioridades</h2>

          <div className="priorities-list">
            {priorities.map((priority) => (
              <div key={priority.id} className="priority-item">
                <span className={`priority-dot priority-dot--${priority.status}`} />
                <p>{priority.title}</p>
                <strong>{priority.time}</strong>
              </div>
            ))}
          </div>

          <div className="unit-status">
            <div className="unit-status__image">
              <LuBuilding size={36} />
            </div>

            <div>
              <strong>Unidade Litoral Sul</strong>
              <span>Status: Operação Normal</span>
            </div>
          </div>
        </div>
      </section>

      <button type="button" className="strategic-floating-button">
        <LuPlus size={26} />
      </button>
    </main>
  );
}