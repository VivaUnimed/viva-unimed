import {
  LuCalendarDays,
  LuFilter,
  LuChevronDown,
  LuChartColumn,
  LuSettings,
  LuBell,
  LuClock,
  LuCirclePlus,
  LuCircleX,
  LuCalendarX,
  LuUsers,
  LuPlus,
} from 'react-icons/lu';
import './styles.css';

const weekDays = [
  { day: 'SEG', number: '23' },
  { day: 'TER', number: '24', active: true },
  { day: 'QUA', number: '25' },
  { day: 'QUI', number: '26' },
  { day: 'SEX', number: '27' },
  { day: 'SÁB', number: '28', disabled: true },
  { day: 'DOM', number: '29', disabled: true },
];

export default function WeeklySchedule() {
  return (
    <main className="weekly-schedule-page">
      <section className="weekly-schedule-header">
        <div>
          <h1>Agenda Semanal</h1>

          <div className="weekly-schedule-header__info">
            <span>
              <LuCalendarDays size={14} />
              23 - 29 de Outubro, 2023
            </span>

            <p>Visualizando: 124 atendimentos esta semana</p>
          </div>
        </div>

        <div className="schedule-view-toggle">
          <button type="button">Dia</button>
          <button type="button" className="schedule-view-toggle__active">
            Semana
          </button>
          <button type="button">Mês</button>
        </div>
      </section>

      <section className="weekly-schedule-top">
        <aside className="quick-filters-card">
          <div className="quick-filters-card__title">
            <LuFilter size={20} />
            <h2>Filtros Rápidos</h2>
          </div>

          <label>
            ESPECIALIDADE
            <div className="quick-filter-select">
              <select defaultValue="">
                <option value="">Todas as Especialidades</option>
                <option value="cardiologia">Cardiologia</option>
                <option value="ortopedia">Ortopedia</option>
                <option value="dermatologia">Dermatologia</option>
                <option value="pediatria">Pediatria</option>
              </select>

              <LuChevronDown size={16} />
            </div>
          </label>

          <label>
            MÉDICO RESPONSÁVEL
            <div className="quick-filter-select">
              <select defaultValue="">
                <option value="">Qualquer Médico</option>
                <option value="ricardo-silva">Dr. Ricardo Silva</option>
                <option value="ana-clara">Dra. Ana Clara</option>
                <option value="marcos-silva">Dr. Marcos Silva</option>
                <option value="beatriz-oliveira">Dra. Beatriz Oliveira</option>
              </select>

              <LuChevronDown size={16} />
            </div>
          </label>

          <div className="schedule-legend">
            <h3>LEGENDA</h3>

            <div className="schedule-legend__grid">
              <span>
                <small className="legend-color legend-color--busy" />
                Ocupado
              </span>

              <span>
                <small className="legend-color legend-color--free" />
                Livre
              </span>

              <span>
                <small className="legend-color legend-color--canceled" />
                Cancelado
              </span>

              <span>
                <small className="legend-color legend-color--emergency" />
                Emergência
              </span>
            </div>
          </div>
        </aside>

        <div className="schedule-indicators">
          <div className="schedule-indicator-card schedule-indicator-card--occupancy">
            <LuChartColumn size={22} />
            <strong>84%</strong>
            <span>OCUPAÇÃO MÉDIA</span>
          </div>

          <div className="schedule-indicator-card schedule-indicator-card--today">
            <LuSettings size={22} />
            <strong>42</strong>
            <span>ATENDIDOS HOJE</span>
          </div>

          <div className="schedule-indicator-card schedule-indicator-card--canceled">
            <LuBell size={22} />
            <strong>08</strong>
            <span>CANCELAMENTOS</span>
          </div>
        </div>
      </section>

      <section className="weekly-calendar-card">
        <div className="weekly-calendar-grid weekly-calendar-grid--header">
          <div className="calendar-time-header">
            <LuClock size={24} />
          </div>

          {weekDays.map((item) => (
            <div
              key={item.day}
              className={`calendar-day-header ${item.active ? 'calendar-day-header--active' : ''} ${
                item.disabled ? 'calendar-day-header--disabled' : ''
              }`}
            >
              <span>{item.day}</span>
              <strong>{item.number}</strong>
            </div>
          ))}
        </div>

        <div className="weekly-calendar-grid calendar-row">
          <div className="calendar-time">08:00</div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--green schedule-event--filled">
              <span>CONSULTA</span>
              <strong>Beatriz Oli...</strong>
              <small>Cardiologia</small>
            </div>
          </div>

          <div className="calendar-cell">
            <button type="button" className="empty-slot">
              <LuCirclePlus size={24} />
            </button>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--canceled">
              <LuCircleX size={18} />
              <strong>CANCELADO</strong>
            </div>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--green schedule-event--filled">
              <span>CHECK-UP</span>
              <strong>Marcos Silva</strong>
            </div>
          </div>

          <div className="calendar-cell">
            <button type="button" className="empty-slot">
              <LuCirclePlus size={24} />
            </button>
          </div>

          <div className="calendar-cell calendar-cell--disabled" />
          <div className="calendar-cell calendar-cell--disabled" />
        </div>

        {/* https://chatgpt.com/g/g-p-69df8a211bf081919c637d6121d3f2fd-vivaunimed/c/69f358e2-f154-83e9-a1c8-04255eb5995d */}
        <div className="weekly-calendar-grid calendar-row">
          <div className="calendar-time">09:00</div>

          <div className="calendar-cell">
            <button type="button" className="empty-slot">
              <LuCirclePlus size={24} />
            </button>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--green schedule-event--filled">
              <span>URGÊNCIA</span>
              <strong>Ana Clara ...</strong>
            </div>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--green schedule-event--filled">
              <span>RETORNO</span>
              <strong>Pedro Gom...</strong>
            </div>
          </div>

          <div className="calendar-cell">
            <button type="button" className="empty-slot empty-slot--simple">
              <LuCirclePlus size={24} />
            </button>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--unavailable">
              <LuCalendarX size={17} />
              <strong>INDISPONÍVEL</strong>
            </div>
          </div>

          <div className="calendar-cell calendar-cell--disabled" />
          <div className="calendar-cell calendar-cell--disabled" />
        </div>

        <div className="weekly-calendar-grid calendar-row">
          <div className="calendar-time">10:00</div>

          <div className="calendar-cell calendar-cell--span-3">
            <div className="team-meeting-event">
              <div className="team-meeting-event__icon">
                <LuUsers size={24} />
              </div>

              <div>
                <strong>Reunião de Equipe Clínica</strong>
                <span>Auditório Central - Ala Norte</span>
              </div>

              <div className="meeting-avatars">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face"
                  alt="Participante"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face"
                  alt="Participante"
                />
                <small>+4</small>
              </div>
            </div>
          </div>

          <div className="calendar-cell">
            <button type="button" className="empty-slot empty-slot--simple">
              <LuCirclePlus size={24} />
            </button>
          </div>

          <div className="calendar-cell">
            <div className="schedule-event schedule-event--green schedule-event--filled">
              <span>PRIMEIRA VEZ</span>
              <strong>Luiza Helena</strong>
            </div>
          </div>

          <div className="calendar-cell calendar-cell--disabled" />
          <div className="calendar-cell calendar-cell--disabled" />
        </div>

        <div className="weekly-calendar-grid calendar-row calendar-row--interval">
          <div className="calendar-time">11:00</div>
          <div className="calendar-interval">HORÁRIO DE INTERVALO</div>
        </div>
      </section>

      {/* <div className="schedule-sync-toast">
        <span />
        <strong>Sincronizado agora: Agenda Dr. Ricardo Silva</strong>
        <button type="button">Desfazer</button>
      </div> */}

      <button type="button" className="schedule-floating-button">
        <LuPlus size={28} />
      </button>
    </main>
  );
}
