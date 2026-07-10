import { useState } from 'react';
import { LuCamera, LuChevronLeft, LuClock, LuSun } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import {
  getProfessionalSpecialtyOptions,
  getProfessionalUnitOptions,
  professionalStatusOptions,
  professionalUfOptions,
  professionalWeekDayOptions,
} from '../../../data/professionals';

const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  crm: '',
  uf: 'RS',
  weeklyHours: '',
  unit: '',
  profilePhoto: null,
  profilePhotoName: '',
  status: 'Ativo',
  morningStart: '08:00',
  morningEnd: '12:00',
  afternoonStart: '13:30',
  afternoonEnd: '18:00',
};

const defaultSelectedDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

const formContentByVariant = {
  create: {
    title: 'Novo Profissional',
    description:
      'Cadastre profissionais que poderão ser vinculados às vagas remanescentes e à agenda operacional.',
    submitLabel: 'Salvar profissional',
    statusLabel: 'Status Inicial',
  },
  edit: {
    title: 'Editar Profissional',
    description:
      'Atualize os dados cadastrais, especialidades e horários do profissional usando o mock local da gestão.',
    submitLabel: 'Salvar alterações',
    statusLabel: 'Status do profissional',
  },
};

export default function ProfessionalForm({
  variant = 'create',
  initialValues = {},
  existingProfessionals = [],
  onSave,
  isSaving = false,
}) {
  const navigate = useNavigate();
  const content = formContentByVariant[variant] ?? formContentByVariant.create;
  const [formData, setFormData] = useState(() => ({
    ...defaultFormData,
    ...initialValues,
    profilePhoto: null,
    profilePhotoName: initialValues.profilePhotoName ?? '',
    morningStart: initialValues.schedule?.morning?.start ?? defaultFormData.morningStart,
    morningEnd: initialValues.schedule?.morning?.end ?? defaultFormData.morningEnd,
    afternoonStart:
      initialValues.schedule?.afternoon?.start ?? defaultFormData.afternoonStart,
    afternoonEnd:
      initialValues.schedule?.afternoon?.end ?? defaultFormData.afternoonEnd,
  }));
  const [errors, setErrors] = useState({});
  const [selectedSpecialties, setSelectedSpecialties] = useState(
    Array.isArray(initialValues.specialties) ? initialValues.specialties : [],
  );
  const [selectedDays, setSelectedDays] = useState(
    Array.isArray(initialValues.schedule?.days) && initialValues.schedule.days.length > 0
      ? initialValues.schedule.days
      : defaultSelectedDays,
  );
  const specialtyOptions = getProfessionalSpecialtyOptions(
    existingProfessionals,
    selectedSpecialties,
  );
  const unitOptions = getProfessionalUnitOptions(existingProfessionals);

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

  const handleChange = ({ target }) => {
    const { name, value, type, files } = target;
    const selectedFile = type === 'file' ? files?.[0] ?? null : null;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === 'file' ? selectedFile : value,
      ...(type === 'file'
        ? { profilePhotoName: selectedFile?.name ?? currentFormData.profilePhotoName }
        : {}),
    }));

    clearFieldError(name);
  };

  const handleToggleSpecialty = (specialty) => {
    const nextSpecialties = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(
          (currentSpecialty) => currentSpecialty !== specialty,
        )
      : [...selectedSpecialties, specialty];

    setSelectedSpecialties(nextSpecialties);

    if (nextSpecialties.length > 0) {
      clearFieldError('specialties');
    }
  };

  const handleToggleDay = (day) => {
    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Informe o nome completo do profissional.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Informe o e-mail corporativo.';
    } else if (!isEmailValid(formData.email.trim())) {
      nextErrors.email = 'Informe um e-mail corporativo válido.';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Informe o telefone ou WhatsApp.';
    }

    if (!formData.crm.trim()) {
      nextErrors.crm = 'Informe o número de registro (CRM).';
    }

    if (selectedSpecialties.length === 0) {
      nextErrors.specialties = 'Selecione ao menos uma especialidade de atuação.';
    }

    if (!formData.unit) {
      nextErrors.unit = 'Selecione a unidade de atendimento.';
    }

    if (!formData.status) {
      nextErrors.status = 'Selecione o status do profissional.';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave?.({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      crm: formData.crm.trim(),
      uf: formData.uf,
      weeklyHours: formData.weeklyHours ? Number(formData.weeklyHours) : null,
      specialties: selectedSpecialties,
      unit: formData.unit,
      status: formData.status,
      profilePhotoName:
        formData.profilePhoto?.name || formData.profilePhotoName || null,
      schedule: {
        days: selectedDays,
        morning: {
          start: formData.morningStart,
          end: formData.morningEnd,
        },
        afternoon: {
          start: formData.afternoonStart,
          end: formData.afternoonEnd,
        },
      },
    });
  };

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
                    placeholder="Ex: Dr. João da Silva"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    className={errors.name ? 'create-professional-input--error' : ''}
                  />
                  {errors.name ? <small>{errors.name}</small> : null}
                </label>

                <label className="create-professional-field">
                  <span>E-mail corporativo</span>
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
                    placeholder="(53) 00000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.phone)}
                    className={errors.phone ? 'create-professional-input--error' : ''}
                  />
                  {errors.phone ? <small>{errors.phone}</small> : null}
                </label>
              </section>

              <section className="create-professional-section">
                <h3 className="create-professional-section__eyebrow">
                  PERFIL E DOCUMENTOS
                </h3>

                <div className="create-professional-upload-field">
                  <span>Foto de Perfil</span>

                  <label
                    htmlFor="profilePhoto"
                    className="create-professional-upload-card"
                  >
                    <div className="create-professional-upload-card__icon">
                      <LuCamera size={26} />
                    </div>

                    <div className="create-professional-upload-card__content">
                      <strong>
                        {formData.profilePhoto?.name ||
                          formData.profilePhotoName ||
                          'Selecionar foto de perfil'}
                      </strong>
                      <span>PNG ou JPG até 2MB.</span>
                      <span>Utilizada na agenda.</span>
                    </div>
                  </label>

                  <input
                    id="profilePhoto"
                    name="profilePhoto"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="create-professional-upload-input"
                    onChange={handleChange}
                  />
                </div>

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
              </section>
            </div>

            <section className="create-professional-section create-professional-section--main">
              <h3 className="create-professional-section__eyebrow">
                ATUAÇÃO PROFISSIONAL
              </h3>

              <div className="create-professional-field">
                <span>Especialidades de atuação</span>

                <div
                  className={`create-professional-specialties professional-specialties${errors.specialties ? ' create-professional-specialties--error professional-specialties--error' : ''}`}
                  role="group"
                  aria-label="Especialidades de atuação"
                >
                  {specialtyOptions.map((specialty) => {
                    const isSelected = selectedSpecialties.includes(specialty);

                    return (
                      <button
                        key={specialty}
                        type="button"
                        className={`create-professional-specialty-option professional-specialty-option${isSelected ? ' create-professional-specialty-option--selected professional-specialty-option--selected' : ''}`}
                        onClick={() => handleToggleSpecialty(specialty)}
                        aria-pressed={isSelected}
                      >
                        {specialty}
                      </button>
                    );
                  })}
                </div>

                <small className="create-professional-field__hint">
                  Selecione uma ou mais especialidades para uso nas vagas
                  remanescentes e na agenda operacional.
                </small>
                {errors.specialties ? <small>{errors.specialties}</small> : null}
              </div>

              <div className="create-professional-row">
                <label className="create-professional-field">
                  <span>Nº Registro (CRM)</span>
                  <input
                    type="text"
                    name="crm"
                    placeholder="00000"
                    value={formData.crm}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.crm)}
                    className={errors.crm ? 'create-professional-input--error' : ''}
                  />
                  {errors.crm ? <small>{errors.crm}</small> : null}
                </label>

                <label className="create-professional-field">
                  <span>UF</span>
                  <select name="uf" value={formData.uf} onChange={handleChange}>
                    {professionalUfOptions.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="create-professional-field">
                <span>Unidade de atendimento</span>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.unit)}
                  className={errors.unit ? 'create-professional-input--error' : ''}
                >
                  <option value="">Selecione uma unidade</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit ? <small>{errors.unit}</small> : null}
              </label>

              <label className="create-professional-field">
                <span>Carga Horária Semanal</span>
                <input
                  type="number"
                  name="weeklyHours"
                  placeholder="40"
                  min="0"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                />
              </label>
            </section>
          </div>

          <section className="create-professional-section create-professional-section--schedule">
            <div className="create-professional-schedule-header">
              <h3 className="create-professional-section__eyebrow">
                HORÁRIO DE ATENDIMENTO
              </h3>
              <span className="create-professional-weekly-badge">
                PADRÃO SEMANAL
              </span>
            </div>

            <div
              className="create-professional-days"
              role="group"
              aria-label="Dias de atendimento"
            >
              {professionalWeekDayOptions.map((day) => {
                const isSelected = selectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    className={`create-professional-day-button${isSelected ? ' create-professional-day-button--active' : ''}`}
                    onClick={() => handleToggleDay(day)}
                    aria-pressed={isSelected}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="create-professional-time-hint">
              Clique no campo de horário para ver sugestões prontas ou digite
              manualmente.
            </div>

            <div className="create-professional-time-grid">
              <div className="create-professional-time-card">
                <div className="create-professional-time-card__title">
                  <LuSun size={18} />
                  <span>Período Manhã</span>
                </div>

                <div className="create-professional-time-inputs">
                  <input
                    type="time"
                    name="morningStart"
                    value={formData.morningStart}
                    onChange={handleChange}
                    step="1800"
                  />
                  <span>até</span>
                  <input
                    type="time"
                    name="morningEnd"
                    value={formData.morningEnd}
                    onChange={handleChange}
                    step="1800"
                  />
                </div>
              </div>

              <div className="create-professional-time-card">
                <div className="create-professional-time-card__title">
                  <LuClock size={18} />
                  <span>Período Tarde</span>
                </div>

                <div className="create-professional-time-inputs">
                  <input
                    type="time"
                    name="afternoonStart"
                    value={formData.afternoonStart}
                    onChange={handleChange}
                    step="1800"
                  />
                  <span>até</span>
                  <input
                    type="time"
                    name="afternoonEnd"
                    value={formData.afternoonEnd}
                    onChange={handleChange}
                    step="1800"
                  />
                </div>
              </div>
            </div>

            <div className="create-professional-schedule-notice">
              <LuClock size={16} />
              <span>
                Estes horários serão replicados para todos os dias úteis
                selecionados acima.
              </span>
            </div>
          </section>

          <div className="create-professional-actions">
            <button
              type="button"
              className="create-professional-actions__cancel"
              onClick={() => navigate('/professionals')}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="create-professional-actions__save"
              disabled={isSaving}
            >
              {content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
