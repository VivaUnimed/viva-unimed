import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuCalendarDays,
  LuSlidersHorizontal,
  LuChevronDown,
  LuClock,
  LuCirclePlus,
  LuChevronLeft,
  LuChevronRight,
  LuRefreshCw,
  LuX,
  LuBadgeAlert,
} from 'react-icons/lu';
import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import { normalizeText } from '../../data/vacancies';
import './styles.css';

// Grade de horários — convenção visual da interface.
// O backend aceita qualquer horário; esta grade é apenas uma referência para o calendário.
const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

// Status reais do backend, mapeados para apresentação visual.
// Reutiliza os CSS modifiers existentes para preservar as cores da interface.
const statusPresentation = {
  open: {
    label: 'Aberta',
    modifier: 'available-vacancy',
  },
  booked: {
    label: 'Reservada',
    modifier: 'occupied',
  },
  cancelled: {
    label: 'Cancelada',
    modifier: 'cancelled',
  },
  expired: {
    label: 'Expirada',
    modifier: 'expired',
  },
  no_show: {
    label: 'No-show',
    modifier: 'no-show',
  },
};

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'open', label: 'Aberta' },
  { value: 'booked', label: 'Reservada' },
  { value: 'free', label: 'Livre' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'expired', label: 'Expirada' },
  { value: 'no_show', label: 'No-show' },
];

const weekdayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const workdayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

const legendItems = [
  { label: 'Reservada', legendClass: 'legend-color--occupied' },
  { label: 'Aberta', legendClass: 'legend-color--available-vacancy' },
  { label: 'Livre', legendClass: 'legend-color--free' },
  { label: 'Cancelada', legendClass: 'legend-color--cancelled' },
  { label: 'Expirada', legendClass: 'legend-color--expired' },
  { label: 'No-show', legendClass: 'legend-color--no-show' },
];

// ==============================
// Utilitários de calendário
// ==============================

function capitalizeText(text) {
  if (!text) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getCalendarDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function formatDateKey(date) {
  const normalizedDate = getCalendarDate(date);

  return [
    normalizedDate.getFullYear(),
    String(normalizedDate.getMonth() + 1).padStart(2, '0'),
    String(normalizedDate.getDate()).padStart(2, '0'),
  ].join('-');
}

function isSameDate(firstDate, secondDate) {
  return formatDateKey(firstDate) === formatDateKey(secondDate);
}

function addDays(date, amount) {
  const nextDate = getCalendarDate(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addMonths(date, amount) {
  const normalizedDate = getCalendarDate(date);
  const targetMonth = new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth() + amount,
    1,
    12,
  );
  const lastDayOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
    12,
  ).getDate();

  targetMonth.setDate(Math.min(normalizedDate.getDate(), lastDayOfMonth));

  return targetMonth;
}

function isWeekend(date) {
  const dayOfWeek = getCalendarDate(date).getDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getStartOfWeek(date) {
  const normalizedDate = getCalendarDate(date);
  const dayOfWeek = normalizedDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return addDays(normalizedDate, diff);
}

function getMonthName(date) {
  return capitalizeText(date.toLocaleDateString('pt-BR', { month: 'long' }));
}

function formatDayMonth(date) {
  return `${date.getDate()} de ${getMonthName(date)}`;
}

function formatDayMonthYear(date) {
  return `${formatDayMonth(date)}, ${date.getFullYear()}`;
}

function formatMonthPeriod(date) {
  return `${getMonthName(date)}, ${date.getFullYear()}`;
}

function formatMonthTitle(date) {
  return `${getMonthName(date)} ${date.getFullYear()}`;
}

function formatWeekPeriod(date) {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = addDays(startOfWeek, 4);
  const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth()
    && startOfWeek.getFullYear() === endOfWeek.getFullYear();
  const sameYear = startOfWeek.getFullYear() === endOfWeek.getFullYear();

  if (sameMonth) {
    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${getMonthName(startOfWeek)}, ${startOfWeek.getFullYear()}`;
  }

  if (sameYear) {
    return `${startOfWeek.getDate()} de ${getMonthName(startOfWeek)} - ${endOfWeek.getDate()} de ${getMonthName(endOfWeek)}, ${startOfWeek.getFullYear()}`;
  }

  return `${startOfWeek.getDate()} de ${getMonthName(startOfWeek)}, ${startOfWeek.getFullYear()} - ${endOfWeek.getDate()} de ${getMonthName(endOfWeek)}, ${endOfWeek.getFullYear()}`;
}

function getDaySummary(date, isActive = false) {
  const normalizedDate = getCalendarDate(date);

  return {
    day: weekdayLabels[normalizedDate.getDay()],
    number: String(normalizedDate.getDate()),
    date: formatDateKey(normalizedDate),
    active: isActive,
  };
}

function getWeekDays(currentDate) {
  const startOfWeek = getStartOfWeek(currentDate);

  return Array.from({ length: 5 }, (_, index) => {
    const date = addDays(startOfWeek, index);

    return getDaySummary(date, isSameDate(date, currentDate));
  });
}

function getMonthDays(currentDate) {
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
    12,
  );
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    12,
  ).getDate();
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    daysInMonth,
    12,
  );

  let firstVisibleDate = firstDayOfMonth;
  while (isWeekend(firstVisibleDate) && firstVisibleDate <= lastDayOfMonth) {
    firstVisibleDate = addDays(firstVisibleDate, 1);
  }

  let lastVisibleDate = lastDayOfMonth;
  while (isWeekend(lastVisibleDate) && lastVisibleDate >= firstDayOfMonth) {
    lastVisibleDate = addDays(lastVisibleDate, -1);
  }

  const startCursor = getStartOfWeek(firstVisibleDate);
  const endCursor = addDays(getStartOfWeek(lastVisibleDate), 4);
  const monthDays = [];
  let index = 0;

  for (
    let cursor = startCursor;
    cursor <= endCursor;
    cursor = addDays(cursor, 1)
  ) {
    if (isWeekend(cursor)) {
      continue;
    }

    const isCurrentMonth = cursor.getMonth() === currentDate.getMonth()
      && cursor.getFullYear() === currentDate.getFullYear();

    if (!isCurrentMonth) {
      monthDays.push({
        id: `month-empty-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`,
        number: '',
        date: null,
        muted: true,
        active: false,
      });
    } else {
      monthDays.push({
        id: formatDateKey(cursor),
        number: String(cursor.getDate()),
        date: formatDateKey(cursor),
        muted: false,
        active: isSameDate(cursor, currentDate),
      });
    }

    index += 1;
  }

  return monthDays;
}

// ==============================
// Transformação de dados
// ==============================

// Converte uma vacancy (do vacancyContext) para o formato de evento de calendário.
function mapVacancyToCalendarEvent(vacancy) {
  return {
    id: vacancy.id,
    date: vacancy.dateKey,
    time: vacancy.time,
    specialty: vacancy.specialty,
    professional: vacancy.professional,
    status: vacancy.vacancyStatus,
    statusText: vacancy.vacancyStatusText,
    rawDate: vacancy.rawDate,
    queuePatients: vacancy.queuePatients || 0,
    formattedDate: vacancy.date,
    doctorId: vacancy.doctorId,
    specialityId: vacancy.specialityId,
  };
}

// Extrai opções únicas de especialidade a partir das vagas carregadas.
function getUniqueValues(items, field) {
  const values = new Set();

  items.forEach((item) => {
    const value = item[field];

    if (value && !value.startsWith('Especialidade #') && !value.startsWith('Profissional #')) {
      values.add(value);
    }
  });

  return [...values].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// ==============================
// Helpers de busca e filtro
// ==============================

function getStatusPresentation(status) {
  return statusPresentation[status] || statusPresentation.open;
}

// Busca appointments para um slot específico.
// Compara pela hora (ignora minutos) para que vagas às 14:30 apareçam no slot 14:00.
function getAppointmentsForSlot(date, timeSlot, appointments = []) {
  const slotHour = timeSlot.split(':')[0];

  return appointments.filter(
    (item) => item.date === date && item.time.split(':')[0] === slotHour,
  );
}

function getAppointmentsByDate(date, appointments = []) {
  return appointments.filter((item) => item.date === date);
}

function formatAppointmentDate(dateString) {
  if (!dateString || !dateString.trim()) {
    return 'Data não informada';
  }

  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    return 'Data não informada';
  }

  const formattedDate = new Date(year, month - 1, day, 12).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

function countAvailableSlots(days, appointments) {
  return days.reduce(
    (total, day) =>
      total + timeSlots.filter((time) => getAppointmentsForSlot(day.date, time, appointments).length === 0).length,
    0,
  );
}

function appointmentMatchesFilters(appointment, filters) {
  const normalizedSpecialtyFilter = normalizeText(filters.specialtyFilter);
  const normalizedProfessionalFilter = normalizeText(filters.professionalFilter);
  const matchesSpecialty =
    !normalizedSpecialtyFilter
    || normalizeText(appointment.specialty) === normalizedSpecialtyFilter;
  const matchesProfessional =
    !normalizedProfessionalFilter
    || normalizeText(appointment.professional) === normalizedProfessionalFilter;
  // "free" não é um status real — quando selecionado, nenhum appointment faz match,
  // resultando em slots todos livres visualmente.
  const matchesStatus = !filters.statusFilter || appointment.status === filters.statusFilter;

  return matchesSpecialty && matchesProfessional && matchesStatus;
}

// ==============================
// Sub-componentes
// ==============================

function EmptySlotButton({ date, time, onEmptySlotClick }) {
  return (
    <button
      type="button"
      className="empty-slot"
      aria-label={`Adicionar vaga remanescente em ${date} às ${time}`}
      onClick={() => onEmptySlotClick(date, time)}
    >
      <LuCirclePlus size={24} />
    </button>
  );
}

function AppointmentCard({ appointment, onOpenDetails, isCompact }) {
  if (!appointment) {
    return null;
  }

  const presentation = getStatusPresentation(appointment.status);
  const cardClasses = `schedule-event schedule-event--filled schedule-event--${presentation.modifier} schedule-event--button ${isCompact ? 'schedule-event--compact' : ''}`;

  return (
    <button
      type="button"
      className={cardClasses}
      aria-haspopup="dialog"
      aria-label={`Ver detalhes da vaga #${appointment.id} às ${appointment.time}`}
      onClick={() => onOpenDetails(appointment)}
    >
      <div className="schedule-event__header">
        <span className="schedule-event__type">
          {appointment.time} &middot; {presentation.label}
        </span>
      </div>

      {isCompact ? (
        <strong className="schedule-event__title schedule-event__title--compact">
          {appointment.specialty} <span style={{ fontWeight: 'normal', color: '#4b5563' }}>&middot; {appointment.professional}</span>
        </strong>
      ) : (
        <>
          <strong className="schedule-event__title">{appointment.specialty}</strong>
          <small className="schedule-event__details">{appointment.professional}</small>
        </>
      )}
    </button>
  );
}

function ScheduleSlotContent({
  appointments,
  hasAppointments,
  showEmptySlot,
  date,
  time,
  onEmptySlotClick,
  onOpenDetails,
}) {
  if (appointments && appointments.length > 0) {
    const isCompact = appointments.length > 1;

    return (
      <div className="calendar-cell-events">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onOpenDetails={onOpenDetails}
            isCompact={isCompact}
          />
        ))}
      </div>
    );
  }

  if (!hasAppointments && showEmptySlot) {
    return (
      <EmptySlotButton
        date={date}
        time={time}
        onEmptySlotClick={onEmptySlotClick}
      />
    );
  }

  return null;
}

function AppointmentDetailsModal({ appointment, onClose }) {
  if (!appointment) {
    return null;
  }

  const presentation = getStatusPresentation(appointment.status);

  return (
    <div className="schedule-details-backdrop" onClick={onClose}>
      <section
        className="schedule-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="schedule-details-modal__header">
          <div>
            <h3 id="schedule-details-title">Detalhes da vaga</h3>
            <p>Informações operacionais desta vaga no calendário.</p>
          </div>

          <button
            type="button"
            className="schedule-details-modal__close"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="schedule-details-modal__status">
          <span
            className={`schedule-details-modal__status-pill schedule-details-modal__status-pill--${presentation.modifier}`}
          >
            {presentation.label}
          </span>
        </div>

        <div className="schedule-details-modal__meta">
          <article>
            <span>ID da vaga</span>
            <strong>#{appointment.id}</strong>
          </article>

          <article>
            <span>Especialidade</span>
            <strong>{appointment.specialty}</strong>
          </article>

          <article>
            <span>Profissional</span>
            <strong>{appointment.professional}</strong>
          </article>

          <article>
            <span>Data</span>
            <strong>{formatAppointmentDate(appointment.date)}</strong>
          </article>

          <article>
            <span>Horário</span>
            <strong>{appointment.time}</strong>
          </article>

          <article>
            <span>Status</span>
            <strong>{presentation.label}</strong>
          </article>

          {appointment.queuePatients > 0 && (
            <article>
              <span>Pacientes na fila compatível</span>
              <strong>
                {appointment.queuePatients}
                {' '}
                {appointment.queuePatients === 1 ? 'paciente' : 'pacientes'}
              </strong>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

// ==============================
// Componente principal
// ==============================

export default function WeeklySchedule() {
  const navigate = useNavigate();
  const { vacancyState, getVacancies } = useVacancies();
  const { vacancies, isLoading, error } = vacancyState;
  const hasLoadedRef = useRef(false);

  const [currentDate, setCurrentDate] = useState(() => getCalendarDate(new Date()));
  const [view, setView] = useState('week');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [professionalFilter, setProfessionalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Carrega vagas reais do backend na montagem do componente.
  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadVacancies = async () => {
      try {
        await getVacancies();
      } catch {
        // O erro de carregamento permanece disponível em vacancyState.error.
      }
    };

    loadVacancies();
  }, [getVacancies]);

  // Transforma vagas do contexto em eventos de calendário.
  const calendarEvents = vacancies.map(mapVacancyToCalendarEvent);

  // Extrai opções de filtro a partir dos dados reais.
  const specialtyOptions = getUniqueValues(calendarEvents, 'specialty');
  const professionalOptions = getUniqueValues(calendarEvents, 'professional');

  // Aplica filtros.
  const filteredAppointments = calendarEvents.filter((appointment) =>
    appointmentMatchesFilters(appointment, {
      specialtyFilter,
      professionalFilter,
      statusFilter,
    }),
  );

  // Estruturas de calendário.
  const currentDay = getDaySummary(currentDate, true);
  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);

  const selectedDayAppointments = getAppointmentsByDate(currentDay.date, filteredAppointments);
  const visibleMonthDates = new Set(
    monthDays
      .filter((item) => item.date)
      .map((item) => item.date),
  );
  const visibleWeekDates = new Set(weekDays.map((item) => item.date));
  const weekAppointments = filteredAppointments.filter((appointment) =>
    visibleWeekDates.has(appointment.date),
  );
  const monthAppointments = filteredAppointments.filter((appointment) =>
    visibleMonthDates.has(appointment.date),
  );

  // "Livre" é um conceito visual (ausência de appointment no slot), não um status real.
  const isFreeSlotsOnlyView = statusFilter === 'free' && !specialtyFilter && !professionalFilter;
  const totalAppointments = isFreeSlotsOnlyView
    ? view === 'day'
      ? countAvailableSlots([currentDay], calendarEvents)
      : view === 'week'
        ? countAvailableSlots(weekDays, calendarEvents)
        : 0
    : view === 'day'
      ? selectedDayAppointments.length
      : view === 'week'
        ? weekAppointments.length
        : monthAppointments.length;
  const totalLabel = isFreeSlotsOnlyView
    ? totalAppointments === 1
      ? 'horário livre'
      : 'horários livres'
    : totalAppointments === 1
      ? 'registro operacional'
      : 'registros operacionais';
  const canShowEmptySlots = !specialtyFilter && !professionalFilter
    && (!statusFilter || statusFilter === 'free');
  const hasActiveFilters = Boolean(specialtyFilter || professionalFilter || statusFilter);

  const periodLabel =
    view === 'month'
      ? formatMonthPeriod(currentDate)
      : view === 'day'
        ? formatDayMonthYear(currentDate)
        : formatWeekPeriod(currentDate);

  const handleCreateVacancy = (date, time) => {
    navigate('/vacancies/new', {
      state: {
        returnTo: '/weeklySchedule',
        returnLabel: 'agenda operacional',
        date,
        time,
      },
    });
  };

  const handleClearFilters = () => {
    setSpecialtyFilter('');
    setProfessionalFilter('');
    setStatusFilter('');
  };

  const handleOpenDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  const handlePreviousPeriod = () => {
    setCurrentDate((previousDate) => (
      view === 'day'
        ? addDays(previousDate, -1)
        : addMonths(previousDate, -1)
    ));
  };

  const handleNextPeriod = () => {
    setCurrentDate((previousDate) => (
      view === 'day'
        ? addDays(previousDate, 1)
        : addMonths(previousDate, 1)
    ));
  };

  const handleRefresh = async () => {
    try {
      await getVacancies();
    } catch {
      // O erro de atualização permanece disponível em vacancyState.error.
    }
  };

  useEffect(() => {
    if (!selectedAppointment) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseDetails();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAppointment]);

  return (
    <main className="weekly-schedule-page">
      <section className="weekly-schedule-header">
        <div>
          <h1>Agenda Operacional</h1>
          <p className="weekly-schedule-header__subtitle">
            Visualize horários ocupados, livres, cancelados e vagas remanescentes
            disponíveis para reaproveitamento.
          </p>

          <div className="weekly-schedule-header__info">
            <span>
              <LuCalendarDays size={14} />
              {periodLabel}
            </span>

            <p>
              {isLoading
                ? 'Carregando agenda...'
                : `Visualizando: ${totalAppointments} ${totalLabel}`}
            </p>
          </div>
        </div>

        <div className="schedule-view-toggle">
          <button
            type="button"
            className={view === 'day' ? 'schedule-view-toggle__active' : ''}
            onClick={() => setView('day')}
          >
            Dia
          </button>
          <button
            type="button"
            className={view === 'week' ? 'schedule-view-toggle__active' : ''}
            onClick={() => setView('week')}
          >
            Semana
          </button>
          <button
            type="button"
            className={view === 'month' ? 'schedule-view-toggle__active' : ''}
            onClick={() => setView('month')}
          >
            Mês
          </button>
        </div>
      </section>

      {error ? (
        <div className="schedule-error-banner" role="alert">
          <LuBadgeAlert size={18} />
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            <LuRefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      ) : null}

      <section className="weekly-schedule-top">
        <div className="weekly-schedule-filters" aria-label="Filtros da agenda operacional">
          <label className="weekly-schedule-filter">
            <LuSlidersHorizontal size={16} />
            <select
              value={specialtyFilter}
              onChange={(event) => setSpecialtyFilter(event.target.value)}
              aria-label="Filtrar por especialidade"
            >
              <option value="">Especialidade</option>
              {specialtyOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="weekly-schedule-filter__chevron" />
          </label>

          <label className="weekly-schedule-filter">
            <LuSlidersHorizontal size={16} />
            <select
              value={professionalFilter}
              onChange={(event) => setProfessionalFilter(event.target.value)}
              aria-label="Filtrar por profissional"
            >
              <option value="">Profissional</option>
              {professionalOptions.map((professional) => (
                <option key={professional} value={professional}>
                  {professional}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="weekly-schedule-filter__chevron" />
          </label>

          <label className="weekly-schedule-filter">
            <LuSlidersHorizontal size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por status da vaga"
            >
              {statusFilterOptions.map((option, index) => (
                <option
                  key={option.value || 'all-status'}
                  value={option.value}
                >
                  {index === 0 ? 'Status da vaga' : option.label}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="weekly-schedule-filter__chevron" />
          </label>

          <button
            type="button"
            className="weekly-schedule-filter-clear-button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <LuRefreshCw size={16} />
            Limpar filtros
          </button>
        </div>

        <div className="schedule-legend">
          <span className="schedule-legend__label">Legenda</span>
          <div className="schedule-legend__grid">
            {legendItems.map((item) => (
              <span key={item.label}>
                <small className={`legend-color ${item.legendClass}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="weekly-calendar-card">
        {view === 'day' && (
          <div className="view-container-day">
            <div className="day-view-header">
              <button
                type="button"
                className="nav-button"
                aria-label="Dia anterior"
                onClick={handlePreviousPeriod}
              >
                <LuChevronLeft size={20} />
              </button>

              <div>
                <span>{currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()}</span>
                <strong>{formatDayMonth(currentDate)}</strong>
              </div>

              <button
                type="button"
                className="nav-button"
                aria-label="Próximo dia"
                onClick={handleNextPeriod}
              >
                <LuChevronRight size={20} />
              </button>
            </div>

            <div className="weekly-calendar-grid weekly-calendar-grid--day weekly-calendar-grid--header">
              <div className="calendar-time-header">
                <LuClock size={24} />
              </div>
              <div className="calendar-day-header calendar-day-header--active">
                <span>{currentDay.day}</span>
                <strong>{currentDay.number}</strong>
              </div>
            </div>

            {isLoading && calendarEvents.length === 0 ? (
              <div className="schedule-empty-state">
                <p>Carregando vagas...</p>
              </div>
            ) : (
              timeSlots.map((time) => (
                <div key={time} className="weekly-calendar-grid weekly-calendar-grid--day calendar-row">
                  <div className="calendar-time">{time}</div>
                  <div className="calendar-cell">
                    <ScheduleSlotContent
                      appointments={getAppointmentsForSlot(currentDay.date, time, filteredAppointments)}
                      hasAppointments={getAppointmentsForSlot(currentDay.date, time, calendarEvents).length > 0}
                      showEmptySlot={canShowEmptySlots}
                      date={currentDay.date}
                      time={time}
                      onEmptySlotClick={handleCreateVacancy}
                      onOpenDetails={handleOpenDetails}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'week' && (
          <div className="view-container-week">
            <div className="weekly-calendar-grid weekly-calendar-grid--week">
              <div className="calendar-time-header">
                <LuClock size={24} />
              </div>

              {weekDays.map((item) => (
                <div
                  key={item.date}
                  className={`calendar-day-header ${item.active ? 'calendar-day-header--active' : ''}`}
                >
                  <span>{item.day}</span>
                  <strong>{item.number}</strong>
                </div>
              ))}

              {isLoading && calendarEvents.length === 0 ? (
                <div className="schedule-empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>Carregando vagas...</p>
                </div>
              ) : (
                timeSlots.map((time, timeIndex) => {
                  const isLastRow = timeIndex === timeSlots.length - 1;

                  return (
                    <React.Fragment key={time}>
                      <div className={`calendar-time ${isLastRow ? 'calendar-time--last-row' : ''}`}>
                        {time}
                      </div>

                      {weekDays.map((day) => (
                        <div
                          key={`${day.date}-${time}`}
                          className={`calendar-cell ${isLastRow ? 'calendar-cell--last-row' : ''}`}
                        >
                          <ScheduleSlotContent
                            appointments={getAppointmentsForSlot(day.date, time, filteredAppointments)}
                            hasAppointments={getAppointmentsForSlot(day.date, time, calendarEvents).length > 0}
                            showEmptySlot={canShowEmptySlots}
                            date={day.date}
                            time={time}
                            onEmptySlotClick={handleCreateVacancy}
                            onOpenDetails={handleOpenDetails}
                          />
                        </div>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="view-container-month">
            <div className="month-view-header">
              <button
                type="button"
                className="nav-button"
                aria-label="Mês anterior"
                onClick={handlePreviousPeriod}
              >
                <LuChevronLeft size={20} />
              </button>

              <strong>{formatMonthTitle(currentDate)}</strong>

              <button
                type="button"
                className="nav-button"
                aria-label="Próximo mês"
                onClick={handleNextPeriod}
              >
                <LuChevronRight size={20} />
              </button>
            </div>

            <div className="month-grid-header">
              {workdayLabels.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="month-grid-body">
              {isLoading && calendarEvents.length === 0 ? (
                <div className="schedule-empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>Carregando vagas...</p>
                </div>
              ) : (
                monthDays.map((day) => {
                  const dayAppointments = day.date
                    ? getAppointmentsByDate(day.date, filteredAppointments)
                    : [];

                  return (
                    <div
                      key={day.id}
                      className={`month-cell ${day.active ? 'month-cell--active' : ''} ${day.muted ? 'month-cell--muted' : ''}`}
                    >
                      <span className="month-day-number">{day.number}</span>

                      <div className="month-events-list">
                        {dayAppointments.slice(0, 2).map((appointment) => {
                          const presentation = getStatusPresentation(appointment.status);

                          return (
                            <button
                              type="button"
                              key={appointment.id}
                              className={`month-event-pill month-event-pill--${presentation.modifier} month-event-pill--button`}
                              onClick={() => handleOpenDetails(appointment)}
                            >
                              {appointment.time} {presentation.label}
                            </button>
                          );
                        })}

                        {dayAppointments.length > 2 && (
                          <small>+{dayAppointments.length - 2} registro(s)</small>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        className="schedule-floating-button"
        aria-label="Adicionar vaga remanescente"
        onClick={() => navigate('/vacancies/new', {
          state: {
            returnTo: '/weeklySchedule',
            returnLabel: 'agenda operacional',
          },
        })}
      >
        <LuCirclePlus size={28} />
      </button>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={handleCloseDetails}
      />
    </main>
  );
}
