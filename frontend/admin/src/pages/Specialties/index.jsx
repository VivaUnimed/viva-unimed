import { useEffect, useState } from 'react';
import {
  LuClipboardList,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuX,
} from 'react-icons/lu';
import { useSpecialties } from '../../context/specialtyContext/specialtyContext';
import './styles.css';

const initialFormState = {
  name: '',
};

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getSummaryLabel(total) {
  return `${total} ${total === 1 ? 'especialidade cadastrada' : 'especialidades cadastradas'} no ambiente administrativo.`;
}

function SpecialtiesModal({
  title,
  description,
  onClose,
  children,
}) {
  return (
    <div className="specialties-modal-backdrop" onClick={onClose}>
      <section
        className="specialties-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialties-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="specialties-modal__header">
          <div>
            <h3 id="specialties-modal-title">{title}</h3>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="specialties-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <LuX size={18} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function DeleteSpecialtyModal({
  specialty,
  isLoading,
  onClose,
  onConfirm,
}) {
  return (
    <SpecialtiesModal
      title="Excluir especialidade"
      description="Essa ação removerá a especialidade cadastrada no ambiente administrativo."
      onClose={onClose}
    >
      <div className="specialties-modal__body specialties-confirmation">
        <p>
          Tem certeza que deseja excluir{' '}
          <strong>{specialty?.name}</strong>?
        </p>

        <div className="specialties-form__actions">
          <button
            type="button"
            className="specialties-form__cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="specialties-form__delete"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </SpecialtiesModal>
  );
}

export default function Specialties() {
  const {
    specialtyState,
    getSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
  } = useSpecialties();
  const { specialties, isLoading, error } = specialtyState;

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [specialtyPendingDelete, setSpecialtyPendingDelete] = useState(null);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        await getSpecialties();
      } catch {
        // O estado global já armazena a falha para a interface.
      }
    };

    loadSpecialties();
  }, []);

  const specialtiesList = Array.isArray(specialties) ? specialties : [];
  const normalizedSearchTerm = normalizeText(searchTerm.trim());
  const hasActiveFilters = Boolean(normalizedSearchTerm);

  const filteredSpecialties = specialtiesList.filter((specialty) => {
    return (
      !normalizedSearchTerm ||
      normalizeText(specialty.name ?? '').includes(normalizedSearchTerm)
    );
  });

  const handleRefresh = async () => {
    try {
      await getSpecialties();
    } catch {
      // O estado global já armazena a falha para a interface.
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
  };

  const handleOpenCreateModal = () => {
    setEditingSpecialtyId(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (specialty) => {
    setEditingSpecialtyId(specialty.id);
    setFormData({
      name: specialty.name ?? '',
    });
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingSpecialtyId(null);
    setFormData(initialFormState);
  };

  const handleOpenDeleteModal = (specialty) => {
    setSpecialtyPendingDelete(specialty);
  };

  const handleCloseDeleteModal = () => {
    setSpecialtyPendingDelete(null);
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
    };

    try {
      if (editingSpecialtyId !== null) {
        await updateSpecialty(payload, editingSpecialtyId);
      } else {
        await createSpecialty(payload);
      }

      handleCloseFormModal();
    } catch {
      // O estado global já armazena a falha para a interface.
    }
  };

  const handleConfirmDelete = async () => {
    if (!specialtyPendingDelete) {
      return;
    }

    try {
      await deleteSpecialty(specialtyPendingDelete.id);
      handleCloseDeleteModal();
    } catch {
      // O estado global já armazena a falha para a interface.
    }
  };

  const getEmptyStateMessage = () => {
    if (isLoading) {
      return 'Carregando especialidades...';
    }

    if (hasActiveFilters) {
      return 'Nenhuma especialidade encontrada para a busca informada.';
    }

    return 'Nenhuma especialidade cadastrada.';
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

      {error ? (
        <div className="specialties-feedback-banner specialties-feedback-banner--error" role="alert">
          <LuX size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="specialties-feedback-banner" role="status">
          <LuRefreshCw size={16} className="specialties-feedback-banner__spinner" />
          <span>Sincronizando especialidades com o backend...</span>
        </div>
      ) : null}

      <section className="specialties-table-card">
        <div className="specialties-table-card__header">
          <div>
            <div className="specialties-table-card__title">
              <LuClipboardList size={20} />
              <h2>Especialidades cadastradas</h2>
            </div>

            <p>{getSummaryLabel(specialtiesList.length)}</p>
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

          <div className="specialties-filters__actions">
            <button
              type="button"
              className="specialties-filter-action-button"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <LuRefreshCw size={16} />
              Atualizar
            </button>

            <button
              type="button"
              className="specialties-filter-action-button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              <LuX size={16} />
              Limpar busca
            </button>
          </div>
        </div>

        <div className="specialties-table-wrapper">
          <table className="specialties-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ESPECIALIDADE</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td>
                      <span className="specialty-id-badge">#{specialty.id}</span>
                    </td>

                    <td>
                      <div className="specialty-info">
                        <strong>{specialty.name}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="specialties-actions">
                        <button
                          type="button"
                          className="specialties-actions__edit"
                          onClick={() => handleOpenEditModal(specialty)}
                          disabled={isLoading}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="specialties-actions__delete"
                          onClick={() => handleOpenDeleteModal(specialty)}
                          disabled={isLoading}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="specialties-table__empty">
                    {getEmptyStateMessage()}
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

      {isFormModalOpen ? (
        <SpecialtiesModal
          title={
            editingSpecialtyId !== null
              ? 'Editar especialidade'
              : 'Nova especialidade'
          }
          description={
            editingSpecialtyId !== null
              ? 'Atualize o nome da especialidade utilizada no sistema.'
              : 'Cadastre uma nova especialidade para uso nas filas, vagas e profissionais.'
          }
          onClose={handleCloseFormModal}
        >
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

            <div className="specialties-form__actions">
              <button
                type="button"
                className="specialties-form__cancel"
                onClick={handleCloseFormModal}
                disabled={isLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="specialties-form__submit"
                disabled={isLoading}
              >
                {isLoading
                  ? editingSpecialtyId !== null
                    ? 'Salvando...'
                    : 'Cadastrando...'
                  : editingSpecialtyId !== null
                    ? 'Salvar alterações'
                    : 'Cadastrar especialidade'}
              </button>
            </div>
          </form>
        </SpecialtiesModal>
      ) : null}

      {specialtyPendingDelete ? (
        <DeleteSpecialtyModal
          specialty={specialtyPendingDelete}
          isLoading={isLoading}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </main>
  );
}
