import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuCalendarDays,
  LuSlidersHorizontal,
  LuChevronDown,
  LuClock,
  LuCirclePlus,
  LuChevronLeft,
  LuChevronRight,
  LuUsers,
  LuRefreshCw,
  LuX,
} from 'react-icons/lu';
import { normalizeText } from '../../data/professionals';
import './styles.css';

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

const specialtyOptions = [
  'Cardiologia',
  'Ortopedia',
  'Clínica Geral',
  'Dermatologia',
  'Pediatria',
];

const professionalOptions = [
  'Dr. Ricardo Almeida',
  'Dra. Mariana Lopes',
  'Dr. Carlos Mendes',
  'Dra. Juliana Castro',
];

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'occupied', label: 'Ocupado' },
  { value: 'free', label: 'Livre' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'available_vacancy', label: 'Vaga remanescente' },
  { value: 'confirmed_by_queue', label: 'Confirmada pela fila' },
  { value: 'expired', label: 'Expirada' },
];

const weekdayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const workdayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

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

function buildOperationalEvents(referenceDate) {
  const today = getCalendarDate(referenceDate);
  const tomorrow = addDays(today, 1);
  const inTwoDays = addDays(today, 2);
  const inThreeDays = addDays(today, 3);
  const startOfWeek = getStartOfWeek(today);
  const monday = addDays(startOfWeek, 0);
  const wednesday = addDays(startOfWeek, 2);

  return [
    {
      id: 1,
      date: formatDateKey(today),
      time: '08:00',
      type: 'OCUPADO',
      patient: 'Beatriz Oliveira',
      details: 'Cardiologia - Dra. Mariana Lopes',
      specialty: 'Cardiologia',
      professional: 'Dra. Mariana Lopes',
      status: 'occupied',
    },
    {
      id: 2,
      date: formatDateKey(today),
      time: '16:00',
      type: 'AGUARDANDO ACEITE',
      patient: 'Vaga remanescente',
      details: 'Pediatria - Expira em 10 min',
      specialty: 'Pediatria',
      professional: 'Dr. Carlos Mendes',
      status: 'available_vacancy',
    },
    {
      id: 3,
      date: formatDateKey(tomorrow),
      time: '09:00',
      type: 'CANCELADO',
      patient: 'Atendimento cancelado',
      details: 'Horário disponível para reaproveitamento',
      specialty: 'Ortopedia',
      professional: 'Dra. Juliana Castro',
      status: 'cancelled',
    },
    {
      id: 4,
      date: formatDateKey(inTwoDays),
      time: '17:00',
      type: 'CONFIRMADA PELA FILA',
      patient: 'Lucas Ferreira',
      details: 'Dermatologia - Dra. Juliana Castro',
      specialty: 'Dermatologia',
      professional: 'Dra. Juliana Castro',
      status: 'confirmed_by_queue',
    },
    {
      id: 5,
      date: formatDateKey(inThreeDays),
      time: '14:00',
      type: 'EXPIRADA',
      patient: 'Sem aceite no prazo',
      details: 'Clínica Geral - Expirou há 8 min',
      specialty: 'Clínica Geral',
      professional: 'Dra. Mariana Lopes',
      status: 'expired',
    },
    {
      id: 6,
      date: formatDateKey(monday),
      time: '10:00',
      type: 'OCUPADO',
      patient: 'Marcos Silva',
      details: 'Ortopedia - Sala 02',
      specialty: 'Ortopedia',
      professional: 'Dr. Carlos Mendes',
      status: 'occupied',
    },
    {
      id: 7,
      date: formatDateKey(wednesday),
      time: '15:00',
      type: 'CONFIRMADA PELA FILA',
      patient: 'Ana Paula',
      details: 'Cardiologia - Dr. Ricardo Almeida',
      specialty: 'Cardiologia',
      professional: 'Dr. Ricardo Almeida',
      status: 'confirmed_by_queue',
    },
  ];
}

const statusPresentation = {
  occupied: {
    label: 'Ocupado',
    modifier: 'occupied',
  },
  cancelled: {
    label: 'Cancelado',
    modifier: 'cancelled',
  },
  available_vacancy: {
    label: 'Vaga remanescente',
    modifier: 'available-vacancy',
    badge: 'Disponível',
    badgeVariant: 'highlight',
  },
  confirmed_by_queue: {
    label: 'Confirmada pela fila',
    modifier: 'confirmed',
    badge: 'Fila confirmou',
    badgeVariant: 'success',
    badgeIcon: LuUsers,
  },
  expired: {
    label: 'Expirada',
    modifier: 'expired',
  },
};

const legendItems = [
  { label: 'Ocupado', legendClass: 'legend-color--occupied' },
  { label: 'Livre', legendClass: 'legend-color--free' },
  { label: 'Cancelado', legendClass: 'legend-color--cancelled' },
  { label: 'Vaga remanescente', legendClass: 'legend-color--available-vacancy' },
  { label: 'Confirmada pela fila', legendClass: 'legend-color--confirmed' },
  { label: 'Expirada', legendClass: 'legend-color--expired' },
];

function getStatusPresentation(status) {
  return statusPresentation[status] || statusPresentation.occupied;
}

function getAppointment(date, time, appointments = []) {
  return appointments.find((item) => item.date === date && item.time === time);
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
      total + timeSlots.filter((time) => !getAppointment(day.date, time, appointments)).length,
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
  const matchesStatus = !filters.statusFilter || appointment.status === filters.statusFilter;

  return matchesSpecialty && matchesProfessional && matchesStatus;
}

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

function AppointmentCard({ appointment, onOpenDetails }) {
  if (!appointment) {
    return null;
  }

  const presentation = getStatusPresentation(appointment.status);
  const BadgeIcon = presentation.badgeIcon;

  return (
    <button
      type="button"
      className={`schedule-event schedule-event--filled schedule-event--${presentation.modifier} schedule-event--button`}
      aria-haspopup="dialog"
      aria-label={`Ver detalhes de ${appointment.patient} às ${appointment.time}`}
      onClick={() => onOpenDetails(appointment)}
    >
      <div className="schedule-event__header">
        <span className="schedule-event__type">{appointment.type}</span>

        {presentation.badge ? (
          <span className={`schedule-event__badge schedule-event__badge--${presentation.badgeVariant}`}>
            {BadgeIcon ? <BadgeIcon size={12} /> : null}
            {presentation.badge}
          </span>
        ) : null}
      </div>

      <strong className="schedule-event__title">{appointment.patient}</strong>
      <small className="schedule-event__details">{appointment.details}</small>
    </button>
  );
}

function ScheduleSlotContent({
  appointment,
  hasAppointment,
  showEmptySlot,
  date,
  time,
  onEmptySlotClick,
  onOpenDetails,
}) {
  if (appointment) {
    return <AppointmentCard appointment={appointment} onOpenDetails={onOpenDetails} />;
  }

  if (!hasAppointment && showEmptySlot) {
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
  const shouldShowType = normalizeText(appointment.type) !== normalizeText(presentation.label);

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
            <h3 id="schedule-details-title">Detalhes do registro</h3>
            <p>Confira todas as informações operacionais deste horário.</p>
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

          {shouldShowType ? (
            <span className="schedule-details-modal__type">{appointment.type}</span>
          ) : null}

          {presentation.badge ? (
            <span className="schedule-details-modal__supporting-badge">
              {presentation.badge}
            </span>
          ) : null}
        </div>

        <div className="schedule-details-modal__meta">
          <article>
            <span>Paciente / registro</span>
            <strong>{appointment.patient}</strong>
          </article>

          <article>
            <span>Especialidade</span>
            <strong>{appointment.specialty}</strong>
          </article>

          <article>
            <span>Médico responsável</span>
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
            <span>Status operacional</span>
            <strong>{presentation.label}</strong>
          </article>
        </div>

        <div className="schedule-details-modal__description">
          <span>Detalhamento</span>
          <p>{appointment.details}</p>
        </div>
      </section>
    </div>
  );
}

export default function WeeklySchedule() {
  const navigate = useNavigate();
  const [referenceDate] = useState(() => getCalendarDate(new Date()));
  const [currentDate, setCurrentDate] = useState(() => getCalendarDate(new Date()));
  const [view, setView] = useState('week');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [professionalFilter, setProfessionalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const operationalEvents = buildOperationalEvents(referenceDate);
  const currentDay = getDaySummary(currentDate, true);
  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const filteredAppointments = operationalEvents.filter((appointment) =>
    appointmentMatchesFilters(appointment, {
      specialtyFilter,
      professionalFilter,
      statusFilter,
    }),
  );
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
  const isFreeSlotsOnlyView = statusFilter === 'free' && !specialtyFilter && !professionalFilter;
  const totalAppointments = isFreeSlotsOnlyView
    ? view === 'day'
      ? countAvailableSlots([currentDay], operationalEvents)
      : view === 'week'
        ? countAvailableSlots(weekDays, operationalEvents)
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
              Visualizando: {totalAppointments} {totalLabel}
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
              aria-label="Filtrar por médico responsável"
            >
              <option value="">Médico responsável</option>
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

            {timeSlots.map((time) => (
              <div key={time} className="weekly-calendar-grid weekly-calendar-grid--day calendar-row">
                <div className="calendar-time">{time}</div>
                <div className="calendar-cell">
                  <ScheduleSlotContent
                    appointment={getAppointment(currentDay.date, time, filteredAppointments)}
                    hasAppointment={Boolean(getAppointment(currentDay.date, time, operationalEvents))}
                    showEmptySlot={canShowEmptySlots}
                    date={currentDay.date}
                    time={time}
                    onEmptySlotClick={handleCreateVacancy}
                    onOpenDetails={handleOpenDetails}
                  />
                </div>
              </div>
            ))}
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

              {timeSlots.map((time, timeIndex) => {
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
                          appointment={getAppointment(day.date, time, filteredAppointments)}
                          hasAppointment={Boolean(getAppointment(day.date, time, operationalEvents))}
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
              })}
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
              {monthDays.map((day) => {
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
                            {appointment.time} {appointment.type}
                          </button>
                        );
                      })}

                      {dayAppointments.length > 2 && (
                        <small>+{dayAppointments.length - 2} registro(s)</small>
                      )}
                    </div>
                  </div>
                );
              })}
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
