import { useEffect, useState } from 'react';
import {
  LuClipboardList,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuX,
  LuPencil,
  LuTrash,
  LuBadgeAlert,
  LuCircleCheck
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
      description="Essa ação removerá a especialidade permanentemente."
      onClose={onClose}
    >
      <div className="specialties-modal__body specialties-confirmation">
        <div className="specialties-confirmation__alert">
          <LuBadgeAlert size={24} />
          <p>
            Tem certeza que deseja excluir <strong>{specialty?.name}</strong>?
          </p>
        </div>
        <p className="specialties-confirmation__warning">
          Essa ação pode impactar profissionais ou vagas que estejam vinculados a esta especialidade.
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
            {isLoading ? 'Excluindo...' : 'Sim, excluir'}
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
        // Erro global
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
      // Erro global
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
      // Erro global
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
      // Erro global
    }
  };

  return (
    <main className="specialties-page">
      <section className="specialties-header">
        <div className="specialties-header__title">
          <h1>Especialidades</h1>
          <p>
            Gerencie as especialidades médicas utilizadas no cadastro de profissionais, vagas e fila inteligente.
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
          <LuBadgeAlert size={20} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="specialties-main-card">
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
              className="specialties-filter-btn"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Atualizar dados"
            >
              <LuRefreshCw size={16} className={isLoading ? 'spin' : ''} />
              Atualizar
            </button>

            <button
              type="button"
              className="specialties-filter-btn specialties-filter-btn--outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              title="Limpar busca"
            >
              <LuX size={16} />
              Limpar
            </button>
          </div>
        </div>

        <div className="specialties-table-wrapper">
          <table className="specialties-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOME DA ESPECIALIDADE</th>
                <th className="align-right">AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td width="100">
                      <span className="specialty-id-badge">#{specialty.id}</span>
                    </td>

                    <td>
                      <strong className="specialty-name">{specialty.name}</strong>
                    </td>

                    <td width="140">
                      <div className="specialties-actions">
                        <button
                          type="button"
                          className="action-btn action-btn--edit"
                          onClick={() => handleOpenEditModal(specialty)}
                          disabled={isLoading}
                          title="Editar"
                        >
                          <LuPencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="action-btn action-btn--delete"
                          onClick={() => handleOpenDeleteModal(specialty)}
                          disabled={isLoading}
                          title="Excluir"
                        >
                          <LuTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="specialties-table__empty">
                    {isLoading ? (
                      <div className="empty-state">
                         <div className="empty-spinner" />
                         <p>Carregando especialidades...</p>
                      </div>
                    ) : hasActiveFilters ? (
                      <div className="empty-state">
                         <div className="empty-state__icon">
                            <LuSearch size={28} />
                         </div>
                         <p>Nenhuma especialidade encontrada para "{searchTerm}".</p>
                      </div>
                    ) : (
                      <div className="empty-state">
                         <div className="empty-state__icon">
                            <LuClipboardList size={28} />
                         </div>
                         <p>Nenhuma especialidade cadastrada ainda.<br/>Cadastre uma especialidade para começar a organizar profissionais e vagas.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              ? 'Atualize o nome da especialidade.'
              : 'Cadastre uma nova especialidade para uso no sistema.'
          }
          onClose={handleCloseFormModal}
        >
          <form className="specialties-form" onSubmit={handleSubmit}>
            <label className="specialties-form__label">
              Nome da especialidade
              <input
                type="text"
                name="name"
                className="specialties-form__input"
                placeholder="Ex: Cardiologia"
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
                {isLoading ? 'Salvando...' : 'Salvar especialidade'}
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
