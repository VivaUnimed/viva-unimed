import { NavLink } from 'react-router';
import Logo from '../../ui/Logo';
import {
  LuLayoutGrid,
  LuCalendarDays,
  LuCalendarX2,
  LuUsers,
  LuSettings,
  LuLogOut,
} from 'react-icons/lu';
import { FaUserDoctor } from 'react-icons/fa6';
import './styles.css';

export default function Sidebar() {

  
  return (
    <aside className="sidebar">
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

          <NavLink to="/weeklySchedule" className="sidebar__link">
            <LuCalendarDays className="sidebar__icon" />
            <span>Agenda</span>
          </NavLink>

          <NavLink to="/vacancies" className="sidebar__link">
            <LuCalendarX2 className="sidebar__icon" />
            <span>Vagas</span>
          </NavLink>

          <NavLink to="/patients" className="sidebar__link">
            <LuUsers className="sidebar__icon" />
            <span>Pacientes</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar__bottom">
        <NavLink to="/configuracoes" className="sidebar__link">
          <LuSettings className="sidebar__icon" />
          <span>Configurações</span>
        </NavLink>

        <button className="sidebar__logout-btn" type="button">
          <LuLogOut className="sidebar__icon" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
