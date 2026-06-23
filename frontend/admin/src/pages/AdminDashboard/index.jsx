import {
  LuCalendarDays,
  LuChartColumn,
  LuClipboard,
  LuTriangleAlert,
} from 'react-icons/lu';
import './styles.css';

const dashboardCards = [
  {
    id: 'vacancies-today',
    title: 'Vagas remanescentes hoje',
    value: '12',
    description: 'Horários identificados para reaproveitamento',
    icon: LuCalendarDays,
    variant: 'green',
  },
  {
    id: 'reuse-rate',
    title: 'Taxa de aproveitamento',
    value: '84%',
    description: 'Vagas preenchidas pela fila',
    icon: LuChartColumn,
    variant: 'light-green',
  },
  {
    id: 'no-show-today',
    title: 'No-show hoje',
    value: '03',
    description: 'Possíveis vagas a reaproveitar',
    icon: LuTriangleAlert,
    variant: 'red',
  },
  {
    id: 'dispatch-failures',
    title: 'Falhas no disparo',
    value: '03',
    description: 'Notificações que exigem atenção',
    icon: LuClipboard,
    variant: 'red',
  },
];

const ongoingVacancies = [
  {
    id: 1,
    time: '14:30',
    specialty: 'Cardiologia',
    professional: 'Dr. Ricardo Almeida',
    status: 'Aguardando aceite',
    detail: 'Expira em 08 min',
    statusVariant: 'pending',
    actionLabel: 'Gerenciar',
  },
  {
    id: 2,
    time: '15:00',
    specialty: 'Ortopedia',
    professional: 'Dra. Heloísa Santos',
    status: 'Confirmada pela fila',
    detail: 'Ana Souza',
    statusVariant: 'confirmed',
    actionLabel: 'Ver confirmação',
  },
  {
    id: 3,
    time: '15:45',
    specialty: 'Pediatria',
    professional: 'Dr. Fábio Mello',
    status: 'Falha no disparo',
    detail: 'Requer atenção',
    statusVariant: 'alert',
    actionLabel: 'Detalhes',
  },
];

function getCurrentDateLabel() {
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [day, month, year] = formattedDate.split(' de ');

  if (!day || !month || !year) {
    return formattedDate;
  }

  return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`;
}

export default function AdminDashboard() {
  const currentDateLabel = getCurrentDateLabel();

  return (
    <main className="strategic-dashboard-page">
      <section className="strategic-dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão consolidada da operação de vagas remanescentes em tempo real.</p>
        </div>

        <div className="strategic-dashboard-date">
          <LuCalendarDays size={14} />
          <span>{currentDateLabel}</span>
        </div>
      </section>

      <section className="strategic-summary-grid">
        {dashboardCards.map((card) => {
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
              </div>

              <h2>{card.title}</h2>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </div>
          );
        })}
      </section>

      <section className="strategic-bottom-grid">
        <div className="schedules-card">
          <div className="schedules-card__header">
            <h2>Vagas em andamento</h2>
            <p>Horários aguardando aceite ou confirmação pela fila inteligente</p>
          </div>

          <div className="schedules-list">
            {ongoingVacancies.map((vacancy) => (
              <div key={vacancy.id} className="schedule-item">
                <div className="schedule-item__time">{vacancy.time}</div>

                <div className="schedule-item__content">
                  <div className="schedule-item__info">
                    <strong>{vacancy.specialty}</strong>
                    <span>{vacancy.professional}</span>

                    <div className="schedule-item__status-row">
                      <span
                        className={`schedule-item__status schedule-item__status--${vacancy.statusVariant}`}
                      >
                        {vacancy.status}
                      </span>
                      <span className="schedule-item__detail">{vacancy.detail}</span>
                    </div>
                  </div>

                  <div className="schedule-item__meta">
                    <button type="button" className="schedule-item__action">
                      {vacancy.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
