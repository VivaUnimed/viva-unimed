import { useEffect, useRef, useState } from 'react';
import {
  LuBadgeAlert,
  LuBadgeCheck,
  LuRefreshCw,
  LuSearch,
  LuSlidersHorizontal,
  LuUserPlus,
  LuChevronDown,
} from 'react-icons/lu';
import './styles.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  formatProfessionalRegistration,
  getProfessionalSpecialtyFilterOptions,
  normalizeText,
} from '../../data/professionals';
import { useProfessionals } from '../../context/professionalContext/professionalContext';
import { formatPhone } from '../../utils/patients/patientFormatters';

const formatPhoneValue = (value) => {
  if (!value) {
    return '-';
  }

  return formatPhone(String(value));
};

export default function Professionals() {
  const location = useLocation();
  const navigate = useNavigate();
  const { professionalState, getProfessionals } = useProfessionals();
  const { professionals, isLoading, error } = professionalState;
  const [feedbackMessage, setFeedbackMessage] = useState(
    () => location.state?.successMessage ?? '',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const hasLoadedProfessionalsRef = useRef(false);

  useEffect(() => {
    const routeFeedbackMessage = location.state?.successMessage;

    if (!routeFeedbackMessage) {
      return;
    }

    setFeedbackMessage(routeFeedbackMessage);
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: null,
      },
    );
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (hasLoadedProfessionalsRef.current) {
      return;
    }

    hasLoadedProfessionalsRef.current = true;

    const loadProfessionals = async () => {
      try {
        await getProfessionals();
      } catch {
        // O erro de carregamento fica armazenado no estado global.
      }
    };

    loadProfessionals();
  }, []);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(normalizedSearchTerm || statusFilter || specialtyFilter);
  const specialtyOptions = getProfessionalSpecialtyFilterOptions(professionals);
  const totalProfessionalsLabel = professionals.length.toLocaleString('pt-BR');

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSpecialtyFilter('');
  };

  const handleRefresh = async () => {
    try {
      await getProfessionals();
    } catch {
      // O erro de atualização fica no estado global.
    }
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      [
        professional.name,
        professional.email,
        professional.phone,
        formatProfessionalRegistration(professional),
        ...professional.specialties,
      ].some((value) => normalizeText(value).includes(normalizedSearchTerm));

    const matchesStatus =
      !statusFilter || professional.status === statusFilter;
    const matchesSpecialty =
      !specialtyFilter || professional.specialties.includes(specialtyFilter);

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const emptyMessage = isLoading
    ? 'Carregando profissionais...'
    : error
      ? 'Não foi possível carregar os profissionais no momento.'
      : hasActiveFilters
        ? 'Nenhum profissional encontrado com os filtros aplicados.'
        : 'Nenhum profissional cadastrado até o momento.';

  return (
    <main className="professionals-page">
      <section className="professionals-header">
        <div>
          <h1>Gestão de Profissionais</h1>
          <p>
            Gerencie profissionais e especialidades usando as rotas atuais de
            Doctor, User e Speciality.
          </p>
        </div>

        <NavLink to="/professionals/new">
          <button type="button" className="professionals-header__button">
            <LuUserPlus size={18} />
            Cadastrar profissional
          </button>
        </NavLink>
      </section>

      {feedbackMessage ? (
        <div className="professionals-feedback-banner" role="status">
          <LuBadgeCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      {error ? (
        <div
          className="professionals-feedback-banner professionals-feedback-banner--error"
          role="alert"
        >
          <LuBadgeAlert size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="professionals-content">
        <div className="professionals-table-card">
          <div className="professionals-table-card__header">
            <h2>Lista de Profissionais</h2>

            <button
              type="button"
              className="professionals-filter-clear-button"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <LuRefreshCw size={16} />
              Atualizar
            </button>
          </div>

          <div className="professionals-filters">
            <div className="professionals-filters__search">
              <LuSearch size={18} />
              <input
                id="professionals-search"
                type="search"
                placeholder="Buscar por nome, especialidade, CRM, telefone ou e-mail..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <label className="professionals-filter-button">
              <LuSlidersHorizontal size={16} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por status"
              >
                <option value="">Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <LuChevronDown
                size={16}
                className="professionals-filter-button__chevron"
              />
            </label>

            <label className="professionals-filter-button">
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
              <LuChevronDown
                size={16}
                className="professionals-filter-button__chevron"
              />
            </label>

            <button
              type="button"
              className="professionals-filter-clear-button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              <LuRefreshCw size={16} />
              Limpar filtros
            </button>
          </div>

          <div className="professionals-table-wrapper">
            <table className="professionals-table">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>ESPECIALIDADES</th>
                  <th>CRM</th>
                  <th>TELEFONE</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>
                {filteredProfessionals.length > 0 ? (
                  filteredProfessionals.map((professional) => {
                    const visibleSpecialties =
                      professional.specialties.slice(0, 2);
                    const remainingSpecialties =
                      professional.specialties.length - visibleSpecialties.length;

                    return (
                      <tr key={professional.id}>
                        <td>
                          <div className="professional-info">
                            <img
                              src={professional.avatar}
                              alt={professional.name}
                            />

                            <div>
                              <strong>{professional.name}</strong>
                              <span>{professional.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="specialties-list">
                            {visibleSpecialties.length > 0 ? (
                              visibleSpecialties.map((specialty) => (
                                <span key={specialty} className="specialty-badge">
                                  {specialty}
                                </span>
                              ))
                            ) : (
                              <span className="specialty-badge specialty-badge--more">
                                Sem vínculo
                              </span>
                            )}

                            {remainingSpecialties > 0 ? (
                              <span className="specialty-badge specialty-badge--more">
                                +{remainingSpecialties}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td>
                          <span className="crm-badge">
                            {formatProfessionalRegistration(professional)}
                          </span>
                        </td>

                        <td>
                          <span className="professional-unit">
                            {formatPhoneValue(professional.phone)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              professional.status === 'Ativo'
                                ? 'status-badge status-badge--active'
                                : 'status-badge status-badge--inactive'
                            }
                          >
                            {professional.status}
                          </span>
                        </td>

                        <td>
                          <div className="professional-actions">
                            <button
                              type="button"
                              className="professional-actions__details"
                              onClick={() =>
                                navigate(`/professionals/${professional.id}`)
                              }
                            >
                              Detalhes
                            </button>

                            <button
                              type="button"
                              className="professional-actions__edit"
                              onClick={() =>
                                navigate(`/professionals/${professional.id}/edit`)
                              }
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
                    <td colSpan="6" className="professionals-table__empty">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="professionals-table-card__footer">
            <span>
              Exibindo {filteredProfessionals.length} de {totalProfessionalsLabel}{' '}
              profissionais
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
