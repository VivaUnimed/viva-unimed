import { useState } from 'react';
import {
  LuBadgeCheck,
  LuUserPlus,
  LuSlidersHorizontal,
  LuSearch,
  LuChevronDown,
  LuRefreshCw,
} from 'react-icons/lu';
import './styles.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  formatProfessionalRegistration,
  getProfessionalSpecialtyOptions,
  getProfessionalUnitOptions,
  getStoredProfessionals,
  normalizeText,
} from '../../data/professionals';

export default function Professionals() {
  const location = useLocation();
  const navigate = useNavigate();
  const feedbackMessage = location.state?.successMessage ?? '';
  const [professionals] = useState(() => getStoredProfessionals());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const totalProfessionalsLabel = professionals.length.toLocaleString('pt-BR');
  const statusOptions = [...new Set(professionals.map((professional) => professional.status))];
  const specialtyOptions = getProfessionalSpecialtyOptions(professionals);
  const unitOptions = getProfessionalUnitOptions(professionals);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(
    normalizedSearchTerm || statusFilter || specialtyFilter || unitFilter
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSpecialtyFilter('');
    setUnitFilter('');
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      [
        professional.name,
        professional.email,
        formatProfessionalRegistration(professional),
        ...professional.specialties,
      ].some((value) => normalizeText(value).includes(normalizedSearchTerm));

    const matchesStatus =
      !statusFilter || professional.status === statusFilter;
    const matchesSpecialty =
      !specialtyFilter || professional.specialties.includes(specialtyFilter);
    const matchesUnit = !unitFilter || professional.unit === unitFilter;

    return matchesSearch && matchesStatus && matchesSpecialty && matchesUnit;
  });

  return (
    <main className="professionals-page">
      <section className="professionals-header">
        <div>
          <h1>Gestão de Profissionais</h1>
          <p>
            Gerencie profissionais e especialidades utilizados no cadastro de
            vagas remanescentes.
          </p>
        </div>

        <NavLink to="/professionals/new">
          <button type="button" className="professionals-header__button">
            <LuUserPlus size={18} />
            Cadastrar Profissional
          </button>
        </NavLink>
      </section>

      {feedbackMessage ? (
        <div className="professionals-feedback-banner" role="status">
          <LuBadgeCheck size={18} />
          <span>{feedbackMessage}</span>
        </div>
      ) : null}

      <section className="professionals-content">
        <div className="professionals-table-card">
          <div className="professionals-table-card__header">
            <h2>Lista de Profissionais</h2>
          </div>

          <div className="professionals-filters">
            <div className="professionals-filters__search">
              <LuSearch size={18} />
              <input
                id="professionals-search"
                type="search"
                placeholder="Buscar por nome, especialidade, CRM ou e-mail..."
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
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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

            <label className="professionals-filter-button">
              <LuSlidersHorizontal size={16} />
              <select
                value={unitFilter}
                onChange={(event) => setUnitFilter(event.target.value)}
                aria-label="Filtrar por unidade"
              >
                <option value="">Unidade</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
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
                  <th>UNIDADE</th>
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
                            {visibleSpecialties.map((specialty) => (
                              <span key={specialty} className="specialty-badge">
                                {specialty}
                              </span>
                            ))}

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
                            {professional.unit}
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
                              className="professional-action-button professional-action-button--primary"
                              onClick={() =>
                                navigate(`/professionals/${professional.id}`)
                              }
                            >
                              Detalhes
                            </button>

                            <button
                              type="button"
                              className="professional-action-button"
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
                      Nenhum profissional encontrado com os filtros aplicados.
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

            <div className="pagination">
              <button type="button">‹</button>
              <button type="button" className="pagination__active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">›</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
