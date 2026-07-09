import { useState } from 'react';
import { LuCheck, LuChevronLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import {
  getProfessionalSpecialtyOptions,
  professionalStatusOptions,
} from '../../../data/professionals';
import { isPhoneValid } from '../../../utils/patients/patientFormatters';

const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  crm: '',
  status: 'Ativo',
};

const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

const formContentByVariant = {
  create: {
    title: 'Novo Profissional',
    description:
      'Cadastre o usuário, o vínculo profissional e as especialidades usando o fluxo atual do backend.',
    submitLabel: 'Salvar profissional',
    statusLabel: 'Status inicial',
  },
  edit: {
    title: 'Editar Profissional',
    description:
      'Atualize os dados básicos do usuário, o cadastro de doctor e os vínculos de especialidade com as rotas existentes.',
    submitLabel: 'Salvar alterações',
    statusLabel: 'Status do profissional',
  },
};

export default function ProfessionalForm({
  variant = 'create',
  initialValues = {},
  specialtyOptions = [],
  onSave,
  isSaving = false,
  submitError = '',
  isLoadingSpecialties = false,
  specialtiesError = '',
}) {
  const navigate = useNavigate();
  const content = formContentByVariant[variant] ?? formContentByVariant.create;
  const [formData, setFormData] = useState(() => ({
    ...defaultFormData,
    ...initialValues,
  }));
  const [errors, setErrors] = useState({});
  const [selectedSpecialityIds, setSelectedSpecialityIds] = useState(
    Array.isArray(initialValues.specialityIds)
      ? initialValues.specialityIds.map((specialityId) => Number(specialityId))
      : [],
  );
  const availableSpecialties = getProfessionalSpecialtyOptions(specialtyOptions);

  const clearFieldError = (fieldName) => {
    setErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    clearFieldError(name);
  };

  const handleToggleSpecialty = (specialityId) => {
    const normalizedSpecialityId = Number(specialityId);

    setSelectedSpecialityIds((currentIds) =>
      currentIds.includes(normalizedSpecialityId)
        ? currentIds.filter((currentId) => currentId !== normalizedSpecialityId)
        : [...currentIds, normalizedSpecialityId],
    );
  };

  const validateForm = () => {
    const nextErrors = {};
    const trimmedPhone = formData.phone.trim();
    const trimmedCpf = formData.cpf.trim();

    if (!formData.name.trim()) {
      nextErrors.name = 'Informe o nome completo do profissional.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Informe o e-mail do profissional.';
    } else if (!isEmailValid(formData.email.trim())) {
      nextErrors.email = 'Informe um e-mail válido.';
    }

    if (trimmedPhone && !/^[\d\s()+-]+$/.test(trimmedPhone)) {
      nextErrors.phone = 'Use apenas números e caracteres de formatação válidos.';
    } else if (trimmedPhone && !isPhoneValid(trimmedPhone)) {
      nextErrors.phone = 'Informe um telefone com DDD válido.';
    }

    if (trimmedCpf && trimmedCpf.replace(/\D/g, '').length !== 11) {
      nextErrors.cpf = 'Informe um CPF com 11 dígitos ou deixe o campo em branco.';
    }

    if (!formData.crm.trim()) {
      nextErrors.crm = 'Informe o CRM do profissional.';
    } else if (formData.crm.trim().length < 4) {
      nextErrors.crm = 'O CRM deve ter ao menos 4 caracteres.';
    }

    if (!formData.status) {
      nextErrors.status = 'Selecione o status do profissional.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSave?.({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      cpf: formData.cpf.trim(),
      crm: formData.crm.trim(),
      status: formData.status,
      specialityIds: selectedSpecialityIds,
    });
  };

  const statusField = (
    <div
      className={`create-professional-status${errors.status ? ' create-professional-status--error' : ''}`}
    >
      <span>{content.statusLabel}</span>

      <div className="create-professional-status__options">
        {professionalStatusOptions.map((status) => (
          <label key={status}>
            <input
              type="radio"
              name="status"
              value={status}
              checked={formData.status === status}
              onChange={handleChange}
            />
            {status}
          </label>
        ))}
      </div>

      {errors.status ? <small>{errors.status}</small> : null}
    </div>
  );

  return (
    <main className="create-professional-page">
      <section className="create-professional-header">
        <div className="create-professional-header__content">
          <button
            type="button"
            className="create-professional-back-button"
            onClick={() => navigate('/professionals')}
          >
            <LuChevronLeft size={20} />
            Voltar para gestão de profissionais
          </button>

          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
      </section>

      <section className="create-professional-card">
        <form className="create-professional-form" onSubmit={handleSubmit} noValidate>
          <div className="create-professional-layout">
            <div className="create-professional-stack">
              <section className="create-professional-section">
                <h3 className="create-professional-section__eyebrow">
                  DADOS PESSOAIS
                </h3>

                <label className="create-professional-field">
                  <span>Nome completo</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: Dra. Joana da Silva"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    className={errors.name ? 'create-professional-input--error' : ''}
                  />
                  {errors.name ? <small>{errors.name}</small> : null}
                </label>

                <label className="create-professional-field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="nome@unimed.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    className={errors.email ? 'create-professional-input--error' : ''}
                  />
                  {errors.email ? <small>{errors.email}</small> : null}
                </label>

                <label className="create-professional-field">
                  <span>Telefone / WhatsApp</span>
                  <input
                    type="text"
                    name="phone"
                    placeholder="(53) 99999-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.phone)}
                    className={errors.phone ? 'create-professional-input--error' : ''}
                  />
                  <small className="create-professional-field__hint">
                    Campo opcional no backend atual.
                  </small>
                  {errors.phone ? <small>{errors.phone}</small> : null}
                </label>

                <label className="create-professional-field">
                  <span>CPF</span>
                  <input
                    type="text"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.cpf)}
                    className={errors.cpf ? 'create-professional-input--error' : ''}
                  />
                  <small className="create-professional-field__hint">
                    Campo opcional, salvo via User.
                  </small>
                  {errors.cpf ? <small>{errors.cpf}</small> : null}
                </label>
              </section>
            </div>

            <section className="create-professional-section create-professional-section--main">
              <h3 className="create-professional-section__eyebrow">
                VÍNCULO PROFISSIONAL
              </h3>

              <div className="create-professional-field">
                <span>Especialidades</span>

                {isLoadingSpecialties ? (
                  <div className="create-professional-empty-state">
                    Carregando especialidades...
                  </div>
                ) : availableSpecialties.length > 0 ? (
                  <div
                    className="create-professional-specialties professional-specialties"
                    role="group"
                    aria-label="Especialidades de atuação"
                  >
                    {availableSpecialties.map((speciality) => {
                      const isSelected = selectedSpecialityIds.includes(
                        Number(speciality.id),
                      );

                      return (
                        <button
                          key={speciality.id}
                          type="button"
                          className={`create-professional-specialty-option professional-specialty-option${isSelected ? ' create-professional-specialty-option--selected professional-specialty-option--selected' : ''}`}
                          onClick={() => handleToggleSpecialty(speciality.id)}
                          aria-pressed={isSelected}
                        >
                          {speciality.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="create-professional-empty-state">
                    Nenhuma especialidade disponível. Cadastre especialidades na gestão
                    administrativa antes de vinculá-las aos profissionais.
                  </div>
                )}

                <small className="create-professional-field__hint">
                  O vínculo é opcional e usa as rotas atuais de adicionar/remover
                  especialidade em Doctor.
                </small>
                {specialtiesError ? <small>{specialtiesError}</small> : null}
              </div>

              <label className="create-professional-field create-professional-field--spaced">
                <span>CRM</span>
                <input
                  type="text"
                  name="crm"
                  placeholder="Ex: 12345-RS"
                  value={formData.crm}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.crm)}
                  className={errors.crm ? 'create-professional-input--error' : ''}
                />
                <small className="create-professional-field__hint">
                  O backend atual persiste o CRM como string única.
                </small>
                {errors.crm ? <small>{errors.crm}</small> : null}
              </label>

              {statusField}
            </section>
          </div>

          {submitError ? (
            <div className="create-professional-feedback create-professional-feedback--error" role="alert">
              <p>{submitError}</p>
            </div>
          ) : null}

          <div className="create-professional-actions">
            <button
              type="button"
              className="create-professional-actions__cancel"
              onClick={() => navigate('/professionals')}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="create-professional-actions__save"
              disabled={isSaving}
            >
              <LuCheck size={16} />
              {isSaving ? 'Salvando...' : content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
