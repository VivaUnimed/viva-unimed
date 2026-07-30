import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBell, LuCircleHelp, LuMenu, LuX } from 'react-icons/lu';
import { useAuth } from '../../../context/authContext/authContext';
import { useQueue } from '../../../context/queueContext/queueContext';
import { useVacancies } from '../../../context/vacancyContext/vacancyContext';
import './styles.css';

const roleLabelMap = {
  Admin: 'Administrador',
  Tecnico: 'Técnico',
  Paciente: 'Paciente',
};

const getProfileItems = (user) => {
  const roleNames = Array.isArray(user?.roles)
    ? user.roles
        .filter(Boolean)
        .map((role) => roleLabelMap[role] || role)
        .join(', ')
    : '';

  const unit =
    user?.unit ||
    user?.unidade ||
    user?.unitName ||
    user?.unit_name ||
    '';

  return [
    { label: 'Nome', value: user?.name || 'Não informado' },
    { label: 'Perfil', value: roleNames || 'Não informado' },
    ...(unit ? [{ label: 'Unidade', value: unit }] : []),
    { label: 'E-mail', value: user?.email || 'Não informado' },
  ];
};

const helpTopics = [
  'Use o painel para acompanhar vagas, fila inteligente, pacientes, profissionais e especialidades.',
  'Cadastre vagas remanescentes pela página Vagas.',
  'A fila inteligente cruza solicitações e vagas compatíveis com os dados disponíveis no sistema.',
  'Cadastre pacientes, profissionais e especialidades antes de operar a agenda.',
  'Algumas configurações operacionais ainda dependem de suporte futuro no backend.',
];

const getTodayKey = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const buildOperationalAlerts = (vacancies = [], queueRequests = []) => {
  const alerts = [];
  const todayKey = getTodayKey();

  const openWithoutPatients = vacancies.filter(
    (vacancy) => vacancy.vacancyStatus === 'open' && vacancy.queuePatients === 0,
  ).length;

  if (openWithoutPatients > 0) {
    alerts.push({
      id: 'open-without-patients',
      title: 'Vagas abertas sem fila compatível',
      description:
        openWithoutPatients === 1
          ? 'Há 1 vaga aberta sem pacientes compatíveis neste momento.'
          : `Há ${openWithoutPatients} vagas abertas sem pacientes compatíveis neste momento.`,
      type: 'alert',
      badgeLabel: 'Vagas',
      actionLabel: 'Abrir vagas',
      route: '/vacancies',
    });
  }

  const requestsWithoutVacancy = queueRequests.filter(
    (queueRequest) =>
      queueRequest.status === 'waiting' &&
      queueRequest.compatibleVacanciesCount === 0,
  ).length;

  if (requestsWithoutVacancy > 0) {
    alerts.push({
      id: 'queue-without-vacancy',
      title: 'Solicitações aguardando sem vaga compatível',
      description:
        requestsWithoutVacancy === 1
          ? 'Há 1 solicitação aguardando sem vaga compatível no momento.'
          : `Há ${requestsWithoutVacancy} solicitações aguardando sem vaga compatível no momento.`,
      type: 'queue',
      badgeLabel: 'Fila',
      actionLabel: 'Abrir fila',
      route: '/queue',
    });
  }

  const expiredToday = vacancies.filter(
    (vacancy) =>
      vacancy.vacancyStatus === 'expired' && vacancy.dateKey === todayKey,
  ).length;

  if (expiredToday > 0) {
    alerts.push({
      id: 'expired-today',
      title: 'Vagas expiradas na agenda de hoje',
      description:
        expiredToday === 1
          ? 'Há 1 vaga com status expirado na agenda de hoje.'
          : `Há ${expiredToday} vagas com status expirado na agenda de hoje.`,
      type: 'error',
      badgeLabel: 'Expiração',
      actionLabel: 'Abrir vagas',
      route: '/vacancies',
    });
  }

  return alerts;
};

function TopbarModal({
  title,
  titleId,
  modalId,
  onClose,
  footerLabel,
  children,
}) {
  return (
    <div className="topbar__modal-backdrop" onClick={onClose}>
      <section
        id={modalId}
        className="topbar__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="topbar__modal-header">
          <h2 id={titleId}>{title}</h2>

          <button
            type="button"
            className="topbar__modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <LuX size={18} />
          </button>
        </div>

        {children}

        <div className="topbar__modal-actions">
          <button
            type="button"
            className="topbar__modal-primary-btn"
            onClick={onClose}
          >
            {footerLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function ProfileModal({ onClose, user }) {
  const profileItems = getProfileItems(user);

  return (
    <TopbarModal
      title="Meu perfil"
      titleId="topbar-profile-title"
      modalId="topbar-profile-modal"
      footerLabel="Fechar"
      onClose={onClose}
    >
      <div className="topbar__modal-content">
        {profileItems.map((item) => (
          <div key={item.label} className="topbar__modal-info">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </TopbarModal>
  );
}

function HelpModal({ onClose }) {
  return (
    <TopbarModal
      title="Ajuda rápida"
      titleId="topbar-help-title"
      modalId="topbar-help-modal"
      footerLabel="Entendi"
      onClose={onClose}
    >
      <div className="topbar__help-content">
        <ul className="topbar__help-list">
          {helpTopics.map((topic) => (
            <li key={topic} className="topbar__help-item">
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </TopbarModal>
  );
}

export default function Topbar({ isSidebarHidden, onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { vacancyState, getVacancies } = useVacancies();
  const { queueState, getQueueRequests } = useQueue();
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const hasRequestedAlertsRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const userName = user?.name || 'Usuário';
  const operationalAlerts = useMemo(
    () =>
      buildOperationalAlerts(
        vacancyState?.vacancies ?? [],
        queueState?.adminAppointmentRequests ?? [],
      ),
    [queueState?.adminAppointmentRequests, vacancyState?.vacancies],
  );
  const isAlertsLoading =
    (vacancyState?.isLoading || queueState?.isLoading) &&
    operationalAlerts.length === 0;
  const alertsError =
    (vacancyState?.error || queueState?.error) && operationalAlerts.length === 0;

  useEffect(() => {
    if (!isMenuOpen && !isNotificationsOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isMenuOpen, isNotificationsOpen]);

  useEffect(() => {
    if (!isMenuOpen && !isNotificationsOpen && !activeModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
        setActiveModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isNotificationsOpen, activeModal]);

  useEffect(() => {
    if (!activeModal) {
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  useEffect(() => {
    if (hasRequestedAlertsRef.current) {
      return;
    }

    hasRequestedAlertsRef.current = true;

    Promise.all([
      getVacancies().catch(() => []),
      getQueueRequests().catch(() => []),
    ]);
  }, [getQueueRequests, getVacancies]);

  const handleToggleMenu = () => {
    setIsNotificationsOpen(false);
    setIsMenuOpen((current) => !current);
  };

  const handleToggleNotifications = () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen((current) => !current);
  };

  const handleOpenProfileModal = () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    setActiveModal('profile');
  };

  const handleOpenHelpModal = () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    setActiveModal('help');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleNavigateToSettings = () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    navigate('/settings');
  };

  const handleNotificationAction = (notification) => {
    setIsNotificationsOpen(false);
    navigate(notification.route || '/vacancies');
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
    await logout();
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <button
            type="button"
            className={`topbar__sidebar-toggle${isSidebarHidden ? ' topbar__sidebar-toggle--active' : ''}`}
            onClick={onToggleSidebar}
            aria-controls="app-sidebar"
            aria-expanded={!isSidebarHidden}
            aria-label={isSidebarHidden ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
            title={isSidebarHidden ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
          >
            <LuMenu className="icon-topbar" />
          </button>
        </div>

        <div className="topbar__actions">
          <div className="topbar__notifications-wrapper" ref={notificationsRef}>
            <button
              type="button"
              className={`topbar__icon-btn${isNotificationsOpen ? ' topbar__icon-btn--active' : ''}`}
              aria-label="Alertas operacionais"
              aria-haspopup="dialog"
              aria-expanded={isNotificationsOpen}
              aria-controls="topbar-notifications"
              onClick={handleToggleNotifications}
            >
              <LuBell className="icon-topbar" />
              {operationalAlerts.length ? (
                <span
                  className="topbar__icon-indicator"
                  aria-label={`${operationalAlerts.length} alertas operacionais`}
                >
                  {operationalAlerts.length}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <section
                id="topbar-notifications"
                className="topbar__notifications-panel"
                role="dialog"
                aria-label="Alertas operacionais"
              >
                <div className="topbar__notifications-header">
                  <h2>Alertas operacionais</h2>
                  <span>{operationalAlerts.length}</span>
                </div>

                <div className="topbar__notifications-list">
                  {isAlertsLoading ? (
                    <p className="topbar__notifications-empty">
                      Atualizando alertas operacionais...
                    </p>
                  ) : alertsError ? (
                    <p className="topbar__notifications-empty">
                      Não foi possível atualizar os alertas no momento.
                    </p>
                  ) : operationalAlerts.length ? (
                    operationalAlerts.map((notification) => (
                      <article
                        key={notification.id}
                        className={`topbar__notification-card topbar__notification-card--${notification.type}`}
                      >
                        <div className="topbar__notification-title-row">
                          <div className="topbar__notification-heading">
                            <span
                              className={`topbar__notification-dot topbar__notification-dot--${notification.type}`}
                              aria-hidden="true"
                            />
                            <strong>{notification.title}</strong>
                          </div>

                          {notification.time ? (
                            <time className="topbar__notification-time">
                              {notification.time}
                            </time>
                          ) : null}
                        </div>

                        <p className="topbar__notification-description">
                          {notification.description}
                        </p>

                        <div className="topbar__notification-footer">
                          <span
                            className={`topbar__notification-badge topbar__notification-badge--${notification.type}`}
                          >
                            {notification.badgeLabel}
                          </span>

                          {notification.actionLabel ? (
                            <button
                              type="button"
                              className="topbar__notification-action"
                              onClick={() => handleNotificationAction(notification)}
                            >
                              {notification.actionLabel}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="topbar__notifications-empty">
                      Nenhum alerta operacional no momento. O sino mostra
                      apenas dados reais de vagas e fila.
                    </p>
                  )}
                </div>
              </section>
            ) : null}
          </div>

          <button
            type="button"
            className={`topbar__icon-btn${activeModal === 'help' ? ' topbar__icon-btn--active' : ''}`}
            onClick={handleOpenHelpModal}
            aria-label="Ajuda rápida"
            aria-haspopup="dialog"
            aria-expanded={activeModal === 'help'}
            aria-controls="topbar-help-modal"
          >
            <LuCircleHelp className="icon-topbar" />
          </button>

          <div className="topbar__profile-menu-wrapper" ref={profileMenuRef}>
            <button
              type="button"
              className={`topbar__profile${isMenuOpen ? ' topbar__profile--active' : ''}`}
              aria-label={`Perfil de ${userName}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="topbar-profile-menu"
              onClick={handleToggleMenu}
              title={userName}
            >
              <img
                src="https://i.pravatar.cc/40?img=18"
                alt={`Avatar de ${userName}`}
                className="topbar__avatar"
              />
            </button>

            {isMenuOpen ? (
              <div
                id="topbar-profile-menu"
                className="topbar__profile-menu"
                role="menu"
                aria-label="Menu do usuário"
              >
                <button
                  type="button"
                  className="topbar__profile-menu-item"
                  role="menuitem"
                  onClick={handleOpenProfileModal}
                >
                  Meu perfil
                </button>

                <button
                  type="button"
                  className="topbar__profile-menu-item"
                  role="menuitem"
                  onClick={handleNavigateToSettings}
                >
                  Configurações
                </button>

                <button
                  type="button"
                  className="topbar__profile-menu-item"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {activeModal === 'profile' ? (
        <ProfileModal onClose={handleCloseModal} user={user} />
      ) : null}

      {activeModal === 'help' ? (
        <HelpModal onClose={handleCloseModal} />
      ) : null}
    </>
  );
}
