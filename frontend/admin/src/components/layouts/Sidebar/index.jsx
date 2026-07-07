import { NavLink } from 'react-router';
import Logo from '../../ui/Logo';
import {
  LuLayoutGrid,
  LuCalendarDays,
  LuUsers,
  LuSettings,
  LuLogOut,
  LuCalendarPlus,
  LuClipboardList,
} from 'react-icons/lu';
import { FaUserDoctor } from 'react-icons/fa6';
import { useAuth } from '../../../context/authContext/authContext';
import './styles.css';

export default function Sidebar({ isHidden = false }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      id="app-sidebar"
      className={`sidebar${isHidden ? ' sidebar--hidden' : ''}`}
      aria-hidden={isHidden}
      aria-label="Menu principal"
    >
      <div className="sidebar__top">
        <div className="sidebar__logo">
          <Logo />
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" className="sidebar__link ">
            <LuLayoutGrid className="sidebar__icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/professionals" className="sidebar__link">
            <FaUserDoctor className="sidebar__icon_Fa" />
            <span>Profissionais</span>
          </NavLink>

          <NavLink to="/specialties" className="sidebar__link">
            <LuClipboardList className="sidebar__icon" />
            <span>Especialidades</span>
          </NavLink>

          <NavLink to="/weeklySchedule" className="sidebar__link">
            <LuCalendarDays className="sidebar__icon" />
            <span>Agenda</span>
          </NavLink>

          <NavLink to="/vacancies" className="sidebar__link">
            <LuCalendarPlus className="sidebar__icon" />
            <span>Vagas</span>
          </NavLink>

          <NavLink to="/patients" className="sidebar__link">
            <LuUsers className="sidebar__icon" />
            <span>Pacientes</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar__bottom">
        <NavLink to="/settings" className="sidebar__link">
          <LuSettings className="sidebar__icon" />
          <span>Configurações</span>
        </NavLink>

        <button
          className="sidebar__logout-btn"
          type="button"
          onClick={handleLogout}
        >
          <LuLogOut className="sidebar__icon" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
