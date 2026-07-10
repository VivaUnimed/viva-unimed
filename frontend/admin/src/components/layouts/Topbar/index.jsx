import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBell, LuCircleHelp, LuMenu, LuX } from 'react-icons/lu';
import { useAuth } from '../../../context/authContext/authContext';
import './styles.css';

const adminProfile = [
  { label: 'Nome', value: 'Administrador Unimed' },
  { label: 'Perfil', value: 'Administrador' },
  { label: 'Unidade', value: 'Unimed Litoral Sul/RS' },
  { label: 'E-mail', value: 'admin@unimed.com' },
];

const helpTopics = [
  'Cadastre vagas remanescentes pela página Vagas.',
  'A fila inteligente é processada automaticamente após o cadastro da vaga.',
  'Acompanhe confirmações, falhas e expirações pelo Dashboard e pela tela de Vagas.',
  'Cadastre pacientes, profissionais e especialidades antes de operar a agenda.',
  'Use Configurações para ajustar tempo de expiração e parâmetros operacionais.',
];

const notificationTypeLabel = {
  error: 'Erro',
  success: 'Sucesso',
  alert: 'Alerta',
};

const mockedNotifications = [
  {
    id: 'vacancy-3-dispatch-error',
    title: 'Falha no disparo',
    description: 'Dermatologia possui uma vaga com falha no envio.',
    time: 'há 5 min',
    type: 'error',
    vacancyId: 3,
    actionLabel: 'Ver vaga',
  },
  {
    id: 'vacancy-5-confirmed',
    title: 'Vaga confirmada',
    description: 'Ginecologia foi confirmada pela fila inteligente.',
    time: 'há 12 min',
    type: 'success',
    vacancyId: 5,
    actionLabel: 'Ver vaga',
  },
  {
    id: 'vacancy-1-expiring',
    title: 'Vaga próxima de expirar',
    description: 'Cardiologia expira em 8 minutos.',
    time: 'agora',
    type: 'alert',
    vacancyId: 1,
    actionLabel: 'Ver vaga',
  },
];

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

function ProfileModal({ onClose }) {
  return (
    <TopbarModal
      title="Meu perfil"
      titleId="topbar-profile-title"
      modalId="topbar-profile-modal"
      footerLabel="Fechar"
      onClose={onClose}
    >
      <div className="topbar__modal-content">
        {adminProfile.map((item) => (
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
  const { logout } = useAuth();
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

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

    if (notification.vacancyId) {
      navigate(`/vacancies/${notification.vacancyId}`);
      return;
    }

    navigate('/vacancies');
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
              aria-label="Notificações"
              aria-haspopup="dialog"
              aria-expanded={isNotificationsOpen}
              aria-controls="topbar-notifications"
              onClick={handleToggleNotifications}
            >
              <LuBell className="icon-topbar" />
              {mockedNotifications.length ? (
                <span className="topbar__icon-indicator" aria-hidden="true" />
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <section
                id="topbar-notifications"
                className="topbar__notifications-panel"
                role="dialog"
                aria-label="Notificações do sistema"
              >
                <div className="topbar__notifications-header">
                  <h2>Notificações</h2>
                  <span>{mockedNotifications.length}</span>
                </div>

                <div className="topbar__notifications-list">
                  {mockedNotifications.length ? (
                    mockedNotifications.map((notification) => (
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

                          <time className="topbar__notification-time">
                            {notification.time}
                          </time>
                        </div>

                        <p className="topbar__notification-description">
                          {notification.description}
                        </p>

                        <div className="topbar__notification-footer">
                          <span
                            className={`topbar__notification-badge topbar__notification-badge--${notification.type}`}
                          >
                            {notificationTypeLabel[notification.type]}
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
                      Nenhuma notificação no momento.
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
              aria-label="Perfil"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="topbar-profile-menu"
              onClick={handleToggleMenu}
            >
              <img
                src="https://i.pravatar.cc/40?img=18"
                alt="Avatar do usuário"
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
                  className="topbar__profile-menu-item topbar__profile-menu-item--disabled"
                  role="menuitem"
                  disabled
                  aria-disabled="true"
                  title="Logout indisponível neste ambiente"
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {activeModal === 'profile' ? (
        <ProfileModal onClose={handleCloseModal} />
      ) : null}

      {activeModal === 'help' ? (
        <HelpModal onClose={handleCloseModal} />
      ) : null}
    </>
  );
}
