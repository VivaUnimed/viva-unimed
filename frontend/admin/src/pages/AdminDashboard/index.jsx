import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuCalendarDays,
  LuCalendarCheck,
  LuCircleCheck,
  LuTriangleAlert,
  LuCircleX,
  LuHistory,
  LuUsers,
  LuBadgeAlert,
  LuChevronRight,
  LuChartColumn
} from 'react-icons/lu';
import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import { useQueue } from '../../context/queueContext/queueContext';
import './styles.css';

function getCurrentDateLabel() {
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const [day, month, year] = formattedDate.split(' de ');
  if (!day || !month || !year) return formattedDate;
  return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { vacancyState, getVacancies } = useVacancies();
  const { queueState, getQueueRequests } = useQueue();
  
  const { vacancies, isLoading: isVacanciesLoading, error: vacanciesError } = vacancyState;
  const { adminAppointmentRequests, isLoading: isQueueLoading, error: queueError } = queueState;
  
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      try {
        await Promise.all([
          getVacancies().catch(() => {}),
          getQueueRequests().catch(() => {})
        ]);
      } catch (e) {
        // Erros são armazenados nos estados correspondentes
      }
    };
    loadData();
  }, [getVacancies, getQueueRequests]);

  const currentDate = new Date();
  const todayKey = currentDate.toISOString().split('T')[0];

  const isLoading = isVacanciesLoading || isQueueLoading;
  const hasError = vacanciesError || queueError;

  // 2. Cards principais
  const openTodayCount = vacancies.filter(v => v.vacancyStatus === 'open' && v.dateKey === todayKey).length;
  const requestsInQueueCount = adminAppointmentRequests.filter(q => q.status === 'waiting').length;
  const bookedCount = vacancies.filter(v => v.vacancyStatus === 'booked').length;
  const noShowTodayCount = vacancies.filter(v => v.vacancyStatus === 'no_show' && v.dateKey === todayKey).length;
  const expiredCount = vacancies.filter(v => v.vacancyStatus === 'expired').length;
  const cancelledCount = vacancies.filter(v => v.vacancyStatus === 'cancelled').length;

  const dashboardCards = [
    {
      id: 'open-today',
      title: 'Vagas abertas hoje',
      value: openTodayCount.toString().padStart(2, '0'),
      description: 'Disponíveis para fila ou avulsas',
      icon: LuCalendarCheck,
      variant: 'green',
    },
    {
      id: 'queue-waiting',
      title: 'Solicitações na fila',
      value: requestsInQueueCount.toString().padStart(2, '0'),
      description: 'Pacientes aguardando vaga',
      icon: LuUsers,
      variant: 'blue',
    },
    {
      id: 'booked-total',
      title: 'Vagas reservadas',
      value: bookedCount.toString().padStart(2, '0'),
      description: 'Preenchidas com sucesso',
      icon: LuCircleCheck,
      variant: 'light-green',
    },
    {
      id: 'no-show-today',
      title: 'No-show hoje',
      value: noShowTodayCount.toString().padStart(2, '0'),
      description: 'Faltas registradas hoje',
      icon: LuTriangleAlert,
      variant: 'red',
    },
  ];

  // 3. Vagas abertas recentes
  const recentOpenVacancies = useMemo(() => {
    return vacancies
      .filter(v => v.vacancyStatus === 'open')
      .slice(0, 5);
  }, [vacancies]);

  // 4. Vagas por status
  const vacanciesByStatus = useMemo(() => {
    const total = vacancies.length || 1;
    const countStatus = (status) => vacancies.filter(v => v.vacancyStatus === status).length;
    return [
      { id: 'open', label: 'Abertas', count: countStatus('open'), color: '#007a49', icon: LuCalendarCheck },
      { id: 'booked', label: 'Reservadas', count: bookedCount, color: '#0f6b47', icon: LuCircleCheck },
      { id: 'no_show', label: 'No-show', count: countStatus('no_show'), color: '#b42318', icon: LuTriangleAlert },
      { id: 'expired', label: 'Expiradas', count: expiredCount, color: '#9a6700', icon: LuHistory },
      { id: 'cancelled', label: 'Canceladas', count: cancelledCount, color: '#5f6368', icon: LuCircleX },
    ].map(item => ({ ...item, percentage: (item.count / total) * 100 }));
  }, [vacancies, bookedCount, expiredCount, cancelledCount]);

  // 5. Fila por especialidade
  const queueBySpecialty = useMemo(() => {
    const waitingRequests = adminAppointmentRequests.filter(q => q.status === 'waiting');
    const counts = {};
    waitingRequests.forEach(req => {
      counts[req.specialtyName] = (counts[req.specialtyName] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [adminAppointmentRequests]);

  // 6. Alertas operacionais
  const operationalAlerts = useMemo(() => {
    const alerts = [];
    
    const openWithoutPatients = vacancies.filter(v => v.vacancyStatus === 'open' && v.queuePatients === 0).length;
    if (openWithoutPatients > 0) {
      alerts.push({
        id: 'open-without-patients',
        type: 'warning',
        message: `${openWithoutPatients} vaga(s) aberta(s) sem pacientes compatíveis na fila.`,
      });
    }

    const expiredToday = vacancies.filter(v => v.vacancyStatus === 'expired' && v.dateKey === todayKey).length;
    if (expiredToday > 0) {
      alerts.push({
        id: 'expired-today',
        type: 'error',
        message: `${expiredToday} vaga(s) expirada(s) no dia de hoje.`,
      });
    }

    const requestsWithoutVacancy = adminAppointmentRequests.filter(q => q.status === 'waiting' && q.compatibleVacanciesCount === 0).length;
    if (requestsWithoutVacancy > 0) {
      alerts.push({
        id: 'req-without-vacancy',
        type: 'warning',
        message: `${requestsWithoutVacancy} solicitação(ões) na fila sem vaga compatível no momento.`,
      });
    }

    return alerts;
  }, [vacancies, adminAppointmentRequests, todayKey]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="strategic-dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Consolidando informações em tempo real...</p>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="strategic-dashboard-error">
          <LuBadgeAlert size={48} />
          <h2>Ops! Algo deu errado.</h2>
          <p>Não foi possível carregar os dados consolidados do dashboard.</p>
          <button type="button" onClick={() => {
            getVacancies().catch(() => {});
            getQueueRequests().catch(() => {});
          }}>
            Tentar Novamente
          </button>
        </div>
      );
    }

    return (
      <>
        <section className="strategic-summary-grid">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className={`strategic-summary-card strategic-summary-card--${card.variant}`}
              >
                <div className="strategic-summary-card__top">
                  <div className="strategic-summary-card__icon">
                    <Icon size={22} />
                  </div>
                </div>
                <h2>{card.title}</h2>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </article>
            );
          })}
        </section>

        <div className="dashboard-main-content">
          <section className="dashboard-column dashboard-column--large">
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <h2>
                  <LuCalendarCheck size={20} /> Vagas abertas recentes
                </h2>
                <button type="button" className="dashboard-panel__link" onClick={() => navigate('/vacancies')}>
                  Ver todas <LuChevronRight size={16} />
                </button>
              </div>
              <div className="dashboard-panel__body">
                {recentOpenVacancies.length > 0 ? (
                  <ul className="recent-vacancies-list">
                    {recentOpenVacancies.map(vacancy => (
                      <li key={vacancy.id} className="recent-vacancy-item">
                        <div className="recent-vacancy-item__time-box">
                          <strong>{vacancy.time}</strong>
                          <span>{vacancy.date}</span>
                        </div>
                        <div className="recent-vacancy-item__info">
                          <strong>{vacancy.specialty}</strong>
                          <span>{vacancy.professional}</span>
                        </div>
                        <div className="recent-vacancy-item__status">
                           <span className={`queue-badge queue-badge--${vacancy.queuePatients > 0 ? 'active' : 'empty'}`}>
                              <LuUsers size={14} /> 
                              {vacancy.queuePatients} {vacancy.queuePatients === 1 ? 'paciente' : 'pacientes'} na fila
                           </span>
                        </div>
                        <button 
                          type="button" 
                          className="recent-vacancy-item__action"
                          onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                        >
                          Gerenciar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">
                      <LuCalendarCheck size={32} />
                    </div>
                    <p>Nenhuma vaga aberta no momento.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <h2>
                  <LuChartColumn size={20} /> Resumo de vagas por status
                </h2>
              </div>
              <div className="dashboard-panel__body">
                <div className="status-bars-container">
                  {vacanciesByStatus.map(status => {
                    const Icon = status.icon;
                    return (
                      <div key={status.id} className="status-bar-item">
                        <div className="status-bar-item__label">
                          <Icon size={16} color={status.color} style={{ stroke: status.color }} />
                          <span>{status.label}</span>
                          <strong>{status.count}</strong>
                        </div>
                        <div className="status-bar-item__track">
                          <div 
                            className="status-bar-item__fill" 
                            style={{ 
                              width: `${status.percentage}%`,
                              backgroundColor: status.color 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-column dashboard-column--small">
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <h2>
                  <LuTriangleAlert size={20} /> Alertas Operacionais
                </h2>
              </div>
              <div className="dashboard-panel__body">
                {operationalAlerts.length > 0 ? (
                  <ul className="alerts-list">
                    {operationalAlerts.map(alert => (
                      <li key={alert.id} className={`alert-item alert-item--${alert.type}`}>
                        <LuTriangleAlert size={20} />
                        <p>{alert.message}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon dashboard-empty-icon--success">
                      <LuCircleCheck size={32} />
                    </div>
                    <p>Nenhum alerta operacional no momento.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <h2>
                  <LuUsers size={20} /> Fila por Especialidade
                </h2>
                <button type="button" className="dashboard-panel__link" onClick={() => navigate('/queue')}>
                  Ver fila <LuChevronRight size={16} />
                </button>
              </div>
              <div className="dashboard-panel__body">
                {queueBySpecialty.length > 0 ? (
                  <ul className="specialty-queue-list">
                    {queueBySpecialty.map(item => (
                      <li key={item.name} className="specialty-queue-item">
                        <span>{item.name}</span>
                        <div className="specialty-queue-item__count">
                          <strong>{item.count}</strong> aguardando
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">
                      <LuUsers size={32} />
                    </div>
                    <p>Fila vazia no momento.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  };

  const currentDateLabel = getCurrentDateLabel();

  return (
    <main className="strategic-dashboard-page">
      <section className="strategic-dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da operação de vagas remanescentes e fila inteligente.</p>
        </div>
        <div className="strategic-dashboard-date">
          <LuCalendarDays size={16} />
          <span>{currentDateLabel}</span>
        </div>
      </section>
      
      {renderContent()}
    </main>
  );
}
