import { useState } from 'react';
import {
  LuBadgeAlert,
  LuBadgeCheck,
  LuChevronDown,
  LuDownload,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuSlidersHorizontal,
} from 'react-icons/lu';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/patientContext/patientContext';
import { normalizeText } from '../../data/patients';
import './styles.css';

const contactOptions = [
  { value: 'valid', label: 'Telefone válido' },
  { value: 'invalid', label: 'Telefone inválido' },
];

function toSlug(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export default function Patients() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientState } = usePatients();
  const patients = patientState.patients;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const feedbackMessage = location.state?.successMessage ?? '';

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const statusOptions = [...new Set(patients.map((patient) => patient.status))];
  const specialtyOptions = [
    ...new Set(patients.flatMap((patient) => patient.interests)),
  ].sort((firstValue, secondValue) => firstValue.localeCompare(secondValue, 'pt-BR'));
  const hasActiveFilters = Boolean(
    normalizedSearchTerm || statusFilter || specialtyFilter || contactFilter,
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSpecialtyFilter('');
    setContactFilter('');
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      [patient.name, patient.phone, patient.email, patient.cpf, ...patient.interests].some(
        (value) => normalizeText(value).includes(normalizedSearchTerm),
      );

    const matchesStatus = !statusFilter || patient.status === statusFilter;
    const matchesSpecialty =
      !specialtyFilter || patient.interests.includes(specialtyFilter);
    const matchesContact =
      !contactFilter ||
      (contactFilter === 'valid' ? patient.phoneValid : !patient.phoneValid);

    return matchesSearch && matchesStatus && matchesSpecialty && matchesContact;
  });

  const totalPatientsLabel = patients.length.toLocaleString('pt-BR');
  const summaryCards = [
    {
      id: 1,
      title: 'TOTAL DE PACIENTES',
      value: totalPatientsLabel,
      helper: 'Cadastros ativos na listagem',
      modifier: 'default',
    },
    {
      id: 2,
      title: 'EM FILA INTELIGENTE',
      value: patients.filter((patient) => patient.status === 'Em fila').length.toString(),
      helper: 'Pacientes aguardando disparo',
      modifier: 'neutral',
    },
    {
      id: 3,
      title: 'COM CONFIRMAÇÃO',
      value: patients
        .filter((patient) => patient.lastConfirmationDate)
        .length.toString(),
      helper: 'Pacientes com retorno registrado',
      modifier: 'highlight',
    },
  ];

  return (
    <main className="patients-page">
      <section className="patients-header">
        <div>
          <h1>Gestão de Pacientes</h1>
          <p>Consulte, cadastre e acompanhe pacientes inscritos na fila inteligente.</p>
        </div>

        <div className="patients-header__actions">
          <button
            type="button"
            className="patients-header__button patients-header__button--secondary"
          >
            <LuDownload size={18} />
            Importar pacientes
          </button>

          <NavLink
            to="/patients/new"
            className="patients-header__button patients-header__button--primary patients-header__link"
          >
            <LuPlus size={18} />
            Novo paciente
          </NavLink>
        </div>
      </section>

      {feedbackMessage ? (
        <div className="patients-feedback-banner" role="status">
          <LuBadgeCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      <section className="patients-stats">
        {summaryCards.map((card) => (
          <article
            key={card.id}
            className={`patient-stat-card patient-stat-card--${card.modifier}`}
          >
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="patients-filters">
        <div className="patients-filters__search">
          <LuSearch size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, e-mail, CPF ou interesse..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <label className="patients-filter-button">
          <LuSlidersHorizontal size={16} />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="">Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} className="patients-filter-button__chevron" />
        </label>

        <label className="patients-filter-button">
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
          <LuChevronDown size={16} className="patients-filter-button__chevron" />
        </label>

        <label className="patients-filter-button">
          <LuSlidersHorizontal size={16} />
          <select
            value={contactFilter}
            onChange={(event) => setContactFilter(event.target.value)}
            aria-label="Filtrar por contato"
          >
            <option value="">Contato</option>
            {contactOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LuChevronDown size={16} className="patients-filter-button__chevron" />
        </label>

        <button
          type="button"
          className="patients-filter-clear-button"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          <LuRefreshCw size={16} />
          Limpar filtros
        </button>
      </section>

      <section className="patients-table-card">
        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>PACIENTE</th>
                <th>CONTATO</th>
                <th>INTERESSES</th>
                <th>STATUS</th>
                <th>ÚLTIMA NOTIFICAÇÃO</th>
                <th>ÚLTIMA CONFIRMAÇÃO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const visibleInterests = patient.interests.slice(0, 2);
                  const hiddenInterests = patient.interests.length - visibleInterests.length;

                  return (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-info">
                          <img src={patient.avatar} alt={patient.name} />

                          <div>
                            <strong>{patient.name}</strong>
                            <span>CPF: {patient.cpf}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="patient-contact">
                          <div className="patient-contact__phone">
                            <strong className="table-main-text">{patient.phone}</strong>
                            <span
                              className={`patient-contact-status patient-contact-status--${patient.phoneValid ? 'valid' : 'invalid'}`}
                              title={patient.phoneValid ? 'Telefone válido' : 'Telefone inválido'}
                              aria-label={patient.phoneValid ? 'Telefone válido' : 'Telefone inválido'}
                            >
                              {patient.phoneValid ? (
                                <LuBadgeCheck size={16} />
                              ) : (
                                <LuBadgeAlert size={16} />
                              )}
                            </span>
                          </div>
                          <span className="table-secondary-text">{patient.email}</span>
                        </div>
                      </td>

                      <td>
                        <div className="patient-interests">
                          {visibleInterests.map((interest) => (
                            <span key={interest} className="patient-interest-badge">
                              {interest}
                            </span>
                          ))}

                          {hiddenInterests > 0 ? (
                            <span className="patient-interest-badge">+{hiddenInterests}</span>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className={`patient-status patient-status--${toSlug(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>

                      <td>
                        <strong className="table-main-text">{patient.lastNotificationDate}</strong>
                        <span
                          className={`notification-status notification-status--${toSlug(patient.lastNotificationStatus)}`}
                        >
                          {patient.lastNotificationStatus}
                        </span>
                      </td>

                      <td>
                        {patient.lastConfirmationDate ? (
                          <>
                            <strong className="table-main-text table-main-text--green">
                              {patient.lastConfirmationDate}
                            </strong>
                            <span className="table-secondary-text">
                              {patient.lastConfirmationSpecialty}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong className="table-main-text">Nenhuma confirmação</strong>
                            <span className="table-secondary-text">Sem retorno registrado</span>
                          </>
                        )}
                      </td>

                      <td>
                        <div className="patient-actions">
                          <button
                            type="button"
                            className="patient-action-button patient-action-button--primary"
                            onClick={() => navigate(`/patients/${patient.id}`)}
                          >
                            Detalhes
                          </button>
                          <button
                            type="button"
                            className="patient-action-button"
                            onClick={() => navigate(`/patients/${patient.id}/edit`)}
                          >
                            Editar
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="patients-table__empty">
                    Nenhum paciente encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="patients-table-card__footer">
          <span>
            Exibindo {filteredPatients.length} de {totalPatientsLabel} pacientes
          </span>

          <div className="patients-pagination">
            <button type="button" disabled>
              ‹
            </button>
            <button type="button" className="patients-pagination__active">
              1
            </button>
            <button type="button" disabled>
              2
            </button>
            <button type="button" disabled>
              3
            </button>
            <button type="button" disabled>
              ›
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
