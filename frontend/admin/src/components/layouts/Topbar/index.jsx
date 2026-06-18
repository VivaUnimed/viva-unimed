import { LuBell, LuCircleHelp, LuSearch } from 'react-icons/lu';
import './styles.css';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <LuSearch className="topbar__search-icon" />
        <input
          type="text"
          placeholder="Busca rápida por paciente para registrar cancelamento..."
        />
      </div>

      <div className="topbar__actions">
        <button type="button" className="topbar__icon-btn">
          <LuBell className='icon-topbar'/>
        </button>

        <button type="button" className="topbar__icon-btn">
          <LuCircleHelp className='icon-topbar'/>
        </button>

        <button type="button" className="topbar__action-btn">
          + Novo Agendamento
        </button>

        <button type="button" className="topbar__profile" aria-label="Perfil">
          <img
            src="https://i.pravatar.cc/40?img=18"
            alt="Avatar do usuário"
            className="topbar__avatar"
          />
        </button>
      </div>
    </header>
  );
}