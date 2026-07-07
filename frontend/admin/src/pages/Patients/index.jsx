import { useEffect, useRef, useState } from 'react';
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
import './styles.css';

const contactOptions = [
  { value: 'with-phone', label: 'Com telefone' },
  { value: 'without-phone', label: 'Sem telefone' },
];

function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const normalizedValue = String(value).trim();
  const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
}

function hasRegisteredPhone(patient) {
  const phone = patient?.user?.phone ?? patient?.phone;

  return Boolean(String(phone ?? '').trim()) && phone !== '-';
}

function getPatientIdentifier(patient) {
  if (patient?.patientId) {
    return `ID do paciente: ${patient.patientId}`;
  }

  if (patient?.userId) {
    return `ID do usuário: ${patient.userId}`;
  }

  return 'ID indisponível';
}

function getPatientInitials(name = '') {
  const [firstName = '', secondName = ''] = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return `${firstName[0] ?? ''}${secondName[0] ?? firstName[1] ?? ''}`.toUpperCase() || 'CL';
}

function getSearchableFields(patient) {
  return [
    patient?.name ?? '',
    patient?.email && patient.email !== '-' ? patient.email : '',
    patient?.phone && patient.phone !== '-' ? patient.phone : '',
    patient?.cpf && patient.cpf !== '-' ? patient.cpf : '',
    patient?.birth ?? '',
    formatDate(patient?.birth),
  ];
}

export default function Patients() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientState, getPatients } = usePatients();
  const patients = patientState.adminPatients;
  const [searchTerm, setSearchTerm] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const hasLoadedPatientsRef = useRef(false);
  const feedbackMessage = location.state?.successMessage ?? '';

  const isMockMode = false;

  useEffect(() => {

    if (isMockMode) {
      return;
    }

    if (hasLoadedPatientsRef.current) {
      return;
    }

    hasLoadedPatientsRef.current = true;

    const loadPatients = async () => {
      try {
        await getPatients();
      } catch {
        // O erro de carregamento fica disponível em patientState.error.
      }
    };

    loadPatients();
  }, []);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(normalizedSearchTerm || contactFilter);

  const handleClearFilters = () => {
    setSearchTerm('');
    setContactFilter('');
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      getSearchableFields(patient).some((value) =>
        normalizeText(value).includes(normalizedSearchTerm),
      );

    const matchesContact =
      !contactFilter ||
      (contactFilter === 'with-phone'
        ? hasRegisteredPhone(patient)
        : !hasRegisteredPhone(patient));

    return matchesSearch && matchesContact;
  });

  const totalPatientsLabel = patients.length.toLocaleString('pt-BR');
  const patientsWithPhone = patients.filter(hasRegisteredPhone).length;
  const patientsWithoutPhone = patients.length - patientsWithPhone;
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
      title: 'COM TELEFONE',
      value: patientsWithPhone.toLocaleString('pt-BR'),
      helper: 'Pacientes com telefone cadastrado',
      modifier: 'neutral',
    },
    {
      id: 3,
      title: 'SEM TELEFONE',
      value: patientsWithoutPhone.toLocaleString('pt-BR'),
      helper: 'Pacientes sem telefone cadastrado',
      modifier: 'highlight',
    },
  ];

  const emptyMessage = patientState.isLoading
    ? 'Carregando pacientes...'
    : patientState.error
      ? 'Não foi possível carregar os pacientes no momento.'
      : hasActiveFilters
        ? 'Nenhum paciente encontrado com os filtros atuais.'
        : 'Nenhum paciente cadastrado até o momento.';

  return (
    <main className="patients-page">
      <section className="patients-header">
        <div>
          <h1>Gestão de Pacientes</h1>
          <p>
            Consulte, cadastre e acompanhe os pacientes da base administrativa.
          </p>
        </div>

        <div className="patients-header__actions">
          <button
            type="button"
            className="patients-header__button patients-header__button--secondary"
            disabled
            title="TODO: importação em lote depende de endpoint confirmado."
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

      {patientState.error ? (
        <div
          className="patients-feedback-banner patients-feedback-banner--error"
          role="alert"
        >
          <LuBadgeAlert size={18} />
          <span>{patientState.error}</span>
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
            placeholder="Buscar por nome, telefone, e-mail, CPF ou nascimento..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

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
          <LuChevronDown
            size={16}
            className="patients-filter-button__chevron"
          />
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
                <th>CPF</th>
                <th>DATA DE NASCIMENTO</th>
                <th>DATA DE CADASTRO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patientId}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-info__avatar" aria-hidden="true">
                          {getPatientInitials(patient.name)}
                        </div>
                        <div>
                          <strong>{patient.name}</strong>
                          <span>{getPatientIdentifier(patient)}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="patient-contact">
                        <strong className="table-main-text">
                          {hasRegisteredPhone(patient) ? patient.phone : '-'}
                        </strong>
                        <span className="table-secondary-text">
                          {patient.email && patient.email !== '-'
                            ? patient.email
                            : '-'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong className="table-main-text">
                        {patient.cpf && patient.cpf !== '-' ? patient.cpf : '-'}
                      </strong>
                    </td>

                    <td>
                      <strong className="table-main-text">
                        {formatDate(patient.birth)}
                      </strong>
                    </td>

                    <td>
                      <strong className="table-main-text">
                        {patient.createdAt
                          ? formatDate(patient.createdAt)
                          : '-'}
                      </strong>
                    </td>

                    <td>
                      <div className="patient-actions">
                        <button
                          type="button"
                          className="patient-action-button patient-action-button--primary"
                          onClick={() =>
                            navigate(`/patients/${patient.patientId}`)
                          }
                        >
                          Detalhes
                        </button>
                        <button
                          type="button"
                          className="patient-action-button"
                          onClick={() =>
                            navigate(`/patients/${patient.patientId}/edit`)
                          }
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="patients-table__empty">
                    {emptyMessage}
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
