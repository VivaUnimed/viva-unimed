import { useState } from 'react';
import {
  LuChevronDown,
  LuClipboardList,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuSlidersHorizontal,
  LuX,
} from 'react-icons/lu';
import './styles.css';

const specialties = [
  {
    id: 1,
    name: 'Cardiologia',
    description:
      'Especialidade voltada ao diagnóstico e tratamento de doenças do coração.',
    professionalsCount: 8,
    patientsInterested: 42,
    activeVacancies: 3,
    status: 'active',
  },
  {
    id: 2,
    name: 'Dermatologia',
    description:
      'Cuida da prevenção, avaliação clínica e tratamentos relacionados à pele.',
    professionalsCount: 5,
    patientsInterested: 28,
    activeVacancies: 1,
    status: 'active',
  },
  {
    id: 3,
    name: 'Ortopedia',
    description:
      'Responsável pelo acompanhamento de lesões, ossos, articulações e postura.',
    professionalsCount: 6,
    patientsInterested: 19,
    activeVacancies: 2,
    status: 'active',
  },
  {
    id: 4,
    name: 'Pediatria',
    description:
      'Atendimento focado no cuidado integral de crianças e adolescentes.',
    professionalsCount: 4,
    patientsInterested: 33,
    activeVacancies: 0,
    status: 'inactive',
  },
  {
    id: 5,
    name: 'Ginecologia',
    description:
      'Especialidade dedicada à saúde da mulher, prevenção e acompanhamento clínico.',
    professionalsCount: 7,
    patientsInterested: 24,
    activeVacancies: 2,
    status: 'active',
  },
];

const statusOptions = [
  { value: '', label: 'Status: Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'inactive', label: 'Inativas' },
];

const professionalsOptions = [
  { value: '', label: 'Profissionais: Todas' },
  { value: 'with-professionals', label: 'Com profissionais' },
  { value: 'without-professionals', label: 'Sem profissionais' },
];

const patientsOptions = [
  { value: '', label: 'Pacientes: Todas' },
  { value: 'with-patients', label: 'Com pacientes na fila' },
  { value: 'without-patients', label: 'Sem pacientes na fila' },
];

const initialFormState = {
  name: '',
  description: '',
  status: 'active',
};

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatStatus(status) {
  return status === 'active' ? 'Ativa' : 'Inativa';
}

export default function Specialties() {
  const [specialtiesList, setSpecialtiesList] = useState(specialties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [professionalsFilter, setProfessionalsFilter] = useState('');
  const [patientsFilter, setPatientsFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(
    normalizedSearchTerm || statusFilter || professionalsFilter || patientsFilter
  );

  const editingSpecialty = specialtiesList.find(
    (specialty) => specialty.id === editingSpecialtyId
  );

  const modalMetrics = editingSpecialty ?? {
    professionalsCount: 0,
    patientsInterested: 0,
    activeVacancies: 0,
  };

  const activeSpecialtiesCount = specialtiesList.filter(
    (specialty) => specialty.status === 'active'
  ).length;

  const inactiveSpecialtiesCount = specialtiesList.length - activeSpecialtiesCount;

  const filteredSpecialties = specialtiesList.filter((specialty) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      normalizeText(specialty.name).includes(normalizedSearchTerm) ||
      normalizeText(specialty.description).includes(normalizedSearchTerm);

    const matchesStatus =
      !statusFilter || specialty.status === statusFilter;

    const matchesProfessionals =
      !professionalsFilter ||
      (professionalsFilter === 'with-professionals'
        ? specialty.professionalsCount > 0
        : specialty.professionalsCount === 0);

    const matchesPatients =
      !patientsFilter ||
      (patientsFilter === 'with-patients'
        ? specialty.patientsInterested > 0
        : specialty.patientsInterested === 0);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesProfessionals &&
      matchesPatients
    );
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProfessionalsFilter('');
    setPatientsFilter('');
  };

  const handleOpenCreateModal = () => {
    setEditingSpecialtyId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (specialty) => {
    setEditingSpecialtyId(specialty.id);
    setFormData({
      name: specialty.name,
      description: specialty.description,
      status: specialty.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpecialtyId(null);
    setFormData(initialFormState);
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextSpecialtyData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
    };

    if (editingSpecialtyId !== null) {
      setSpecialtiesList((currentList) =>
        currentList.map((specialty) =>
          specialty.id === editingSpecialtyId
            ? { ...specialty, ...nextSpecialtyData }
            : specialty
        )
      );
    } else {
      setSpecialtiesList((currentList) => [
        {
          id: Math.max(0, ...currentList.map((specialty) => specialty.id)) + 1,
          professionalsCount: 0,
          patientsInterested: 0,
          activeVacancies: 0,
          ...nextSpecialtyData,
        },
        ...currentList,
      ]);
    }

    handleCloseModal();
  };

  const handleToggleStatus = (specialtyId) => {
    setSpecialtiesList((currentList) =>
      currentList.map((specialty) =>
        specialty.id === specialtyId
          ? {
              ...specialty,
              status: specialty.status === 'active' ? 'inactive' : 'active',
            }
          : specialty
      )
    );
  };

  return (
    <main className="specialties-page">
      <section className="specialties-header">
        <div>
          <h1>Gestão de Especialidades</h1>
          <p>
            Gerencie as especialidades utilizadas nas vagas, profissionais e fila
            inteligente.
          </p>
        </div>

        <button
          type="button"
          className="specialties-header__button"
          onClick={handleOpenCreateModal}
        >
          <LuPlus size={18} />
          Nova especialidade
        </button>
      </section>

      <section className="specialties-table-card">
        <div className="specialties-table-card__header">
          <div>
            <div className="specialties-table-card__title">
              <LuClipboardList size={20} />
              <h2>Especialidades cadastradas</h2>
            </div>

            <p>
              {activeSpecialtiesCount} ativas e {inactiveSpecialtiesCount} inativas
              no ambiente administrativo.
            </p>
          </div>
        </div>

        <div className="specialties-filters">
          <div className="specialties-filters__search">
            <LuSearch size={18} />
            <input
              type="search"
              placeholder="Buscar por nome da especialidade..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <label className="specialties-filter-button">
            <LuSlidersHorizontal size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por status"
            >
              {statusOptions.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="specialties-filter-button__chevron" />
          </label>

          <label className="specialties-filter-button specialties-filter-button--wide">
            <LuSlidersHorizontal size={16} />
            <select
              value={professionalsFilter}
              onChange={(event) => setProfessionalsFilter(event.target.value)}
              aria-label="Filtrar por quantidade de profissionais"
            >
              {professionalsOptions.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="specialties-filter-button__chevron" />
          </label>

          <label className="specialties-filter-button specialties-filter-button--wide">
            <LuSlidersHorizontal size={16} />
            <select
              value={patientsFilter}
              onChange={(event) => setPatientsFilter(event.target.value)}
              aria-label="Filtrar por pacientes interessados"
            >
              {patientsOptions.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <LuChevronDown size={16} className="specialties-filter-button__chevron" />
          </label>

          <button
            type="button"
            className="specialties-filter-clear-button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <LuRefreshCw size={16} />
            Limpar filtros
          </button>
        </div>

        <div className="specialties-table-wrapper">
          <table className="specialties-table">
            <thead>
              <tr>
                <th>ESPECIALIDADE</th>
                <th>PROFISSIONAIS VINCULADOS</th>
                <th>PACIENTES INTERESSADOS</th>
                <th>VAGAS ABERTAS</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td>
                      <div className="specialty-info">
                        <strong>{specialty.name}</strong>
                        <span>{specialty.description}</span>
                      </div>
                    </td>

                    <td>
                      <div className="specialty-metric">
                        <strong>{specialty.professionalsCount}</strong>
                        <span>
                          {specialty.professionalsCount === 1
                            ? 'profissional'
                            : 'profissionais'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="specialty-metric">
                        <strong>{specialty.patientsInterested}</strong>
                        <span>
                          {specialty.patientsInterested === 1
                            ? 'paciente'
                            : 'pacientes'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="specialty-metric specialty-metric--vacancies">
                        <strong>{specialty.activeVacancies}</strong>
                        <span>
                          {specialty.activeVacancies === 1 ? 'vaga aberta' : 'vagas abertas'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          specialty.status === 'active'
                            ? 'specialties-status-badge specialties-status-badge--active'
                            : 'specialties-status-badge specialties-status-badge--inactive'
                        }
                      >
                        {formatStatus(specialty.status)}
                      </span>
                    </td>

                    <td>
                      <div className="specialties-actions">
                        <button
                          type="button"
                          className="specialties-actions__edit"
                          onClick={() => handleOpenEditModal(specialty)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            specialty.status === 'active'
                              ? 'specialties-actions__deactivate'
                              : 'specialties-actions__activate'
                          }
                          onClick={() => handleToggleStatus(specialty.id)}
                        >
                          {specialty.status === 'active' ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="specialties-table__empty">
                    Nenhuma especialidade encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="specialties-table-card__footer">
          <span>
            Exibindo {filteredSpecialties.length} de {specialtiesList.length}{' '}
            especialidades
          </span>
        </div>
      </section>

      {isModalOpen ? (
        <div className="specialties-modal-backdrop" onClick={handleCloseModal}>
          <section
            className="specialties-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specialties-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="specialties-modal__header">
              <div>
                <h3 id="specialties-modal-title">
                  {editingSpecialtyId !== null
                    ? 'Editar especialidade'
                    : 'Nova especialidade'}
                </h3>
                <p>
                  {editingSpecialtyId !== null
                    ? 'Atualize os dados da especialidade utilizada no sistema.'
                    : 'Cadastre uma nova especialidade para uso nas filas, vagas e profissionais.'}
                </p>
              </div>

              <button
                type="button"
                className="specialties-modal__close"
                onClick={handleCloseModal}
                aria-label="Fechar modal"
              >
                <LuX size={18} />
              </button>
            </div>

            <form className="specialties-form" onSubmit={handleSubmit}>
              <label>
                Nome da especialidade
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Oftalmologia"
                  value={formData.name}
                  onChange={handleChangeForm}
                  maxLength={80}
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  name="description"
                  placeholder="Descreva brevemente o contexto de uso desta especialidade."
                  value={formData.description}
                  onChange={handleChangeForm}
                  rows={4}
                  maxLength={220}
                  required
                />
              </label>

              <label className="specialties-form__status-field">
                Status inicial
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChangeForm}
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </label>

              <div className="specialties-form__meta">
                <article>
                  <span>Profissionais vinculados</span>
                  <strong>{modalMetrics.professionalsCount}</strong>
                </article>

                <article>
                  <span>Pacientes interessados</span>
                  <strong>{modalMetrics.patientsInterested}</strong>
                </article>

                <article>
                  <span>Vagas abertas</span>
                  <strong>{modalMetrics.activeVacancies}</strong>
                </article>
              </div>

              <div className="specialties-form__actions">
                <button
                  type="button"
                  className="specialties-form__cancel"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="specialties-form__submit">
                  {editingSpecialtyId !== null
                    ? 'Salvar alterações'
                    : 'Cadastrar especialidade'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
