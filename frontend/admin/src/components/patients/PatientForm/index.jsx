import { useState } from 'react';
import {
  LuChevronLeft,
  LuHeartPulse,
  LuPencilLine,
  LuSave,
  LuUserRoundPlus,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../context/patientContext/patientContext';
import {
  getPatientSpecialtyOptions,
  isPhoneValid,
  patientStatusOptions,
} from '../../../data/patients';
import '../../../pages/CreatePatient/styles.css';

const defaultFormState = {
  name: '',
  cpf: '',
  phone: '',
  email: '',
  interests: [],
  status: 'Em fila',
};

const formContentByVariant = {
  create: {
    badgeIcon: LuUserRoundPlus,
    badgeLabel: 'Novo paciente',
    title: 'Cadastrar paciente',
    description:
      'Preencha os dados do paciente e selecione as especialidades de interesse para participação na fila inteligente.',
    statusLabel: 'Status inicial',
    queueDescription:
      'Defina o status inicial e as especialidades de interesse desse paciente.',
    notice:
      'Após o cadastro, o paciente passa a aparecer imediatamente na gestão de pacientes e permanece salvo mesmo após atualizar a página.',
    submitLabel: 'Salvar paciente',
  },
  edit: {
    badgeIcon: LuPencilLine,
    badgeLabel: 'Editar paciente',
    title: 'Editar paciente',
    description:
      'Atualize os dados cadastrais e os interesses do paciente mantendo o mesmo padrão da fila inteligente.',
    statusLabel: 'Status do paciente',
    queueDescription:
      'Revise o status atual e as especialidades de interesse vinculadas a esse cadastro.',
    notice:
      'As alterações ficam disponíveis imediatamente na gestão de pacientes e permanecem salvas mesmo após atualizar a página.',
    submitLabel: 'Salvar alterações',
  },
};

const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

const isMaskedCpfValue = (value) => /^\d{3}\.\*{3}\.\*{3}-\d{2}$/.test(value.trim());

export default function PatientForm({
  variant = 'create',
  initialValues = defaultFormState,
  onSave,
}) {
  const navigate = useNavigate();
  const { patientState } = usePatients();
  const [formData, setFormData] = useState(() => ({
    ...defaultFormState,
    ...initialValues,
    interests: Array.isArray(initialValues.interests) ? initialValues.interests : [],
  }));
  const [errors, setErrors] = useState({});
  const content = formContentByVariant[variant] ?? formContentByVariant.create;
  const specialtyOptions = getPatientSpecialtyOptions(
    patientState.patients,
    formData.interests,
  );
  const BadgeIcon = content.badgeIcon;

  const handleChange = ({ target: { name, value } }) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleToggleInterest = (specialty) => {
    const nextInterests = formData.interests.includes(specialty)
      ? formData.interests.filter((currentSpecialty) => currentSpecialty !== specialty)
      : [...formData.interests, specialty];

    setFormData((currentFormData) => ({
      ...currentFormData,
      interests: nextInterests,
    }));

    if (nextInterests.length > 0) {
      setErrors((currentErrors) => {
        if (!currentErrors.interests) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors.interests;
        return nextErrors;
      });
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const trimmedCpf = formData.cpf.trim();
    const trimmedPhone = formData.phone.trim();
    const cpfDigits = trimmedCpf.replace(/\D/g, '');
    const isCpfValid =
      variant === 'edit'
        ? isMaskedCpfValue(trimmedCpf) || cpfDigits.length === 11
        : cpfDigits.length === 11;
    const canKeepCurrentPhone =
      variant === 'edit' && trimmedPhone === initialValues.phone?.trim();
    const isPhoneFieldValid = canKeepCurrentPhone || isPhoneValid(trimmedPhone);

    if (!formData.name.trim()) {
      nextErrors.name = 'Informe o nome completo do paciente.';
    }

    if (!isCpfValid) {
      nextErrors.cpf = 'Informe um CPF com 11 dígitos.';
    }

    if (!trimmedPhone) {
      nextErrors.phone = 'Informe um telefone com DDD válido.';
    } else if (!/^[\d\s()+-]+$/.test(trimmedPhone)) {
      nextErrors.phone = 'Use apenas números e caracteres de formatação válidos.';
    } else if (!isPhoneFieldValid) {
      nextErrors.phone = 'Informe um telefone com DDD válido.';
    }

    if (!isEmailValid(formData.email.trim())) {
      nextErrors.email = 'Informe um e-mail válido.';
    }

    if (!formData.interests.length) {
      nextErrors.interests = 'Selecione ao menos uma especialidade de interesse.';
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
      ...formData,
      name: formData.name.trim(),
      cpf: formData.cpf.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      interests: formData.interests,
    });
  };

  return (
    <main className="create-patient-page">
      <section className="create-patient-header">
        <div>
          <button
            type="button"
            className="create-patient-back-button"
            onClick={() => navigate('/patients')}
          >
            <LuChevronLeft size={18} />
            Voltar para gestão de pacientes
          </button>

          <div className="create-patient-header__content">
            <span className="create-patient-badge">
              <BadgeIcon size={16} />
              {content.badgeLabel}
            </span>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
        </div>
      </section>

      <section className="create-patient-card">
        <form className="create-patient-form" onSubmit={handleSubmit}>
          <div className="create-patient-form__section">
            <div className="create-patient-form__section-header">
              <h2>Dados cadastrais</h2>
              <p>Essas informações serão usadas na busca e identificação do paciente.</p>
            </div>

            <div className="create-patient-form__grid">
              <label className="create-patient-field">
                <span>Nome completo</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Maria da Silva"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name ? <small>{errors.name}</small> : null}
              </label>

              <label className="create-patient-field">
                <span>CPF</span>
                <input
                  type="text"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                />
                {errors.cpf ? <small>{errors.cpf}</small> : null}
              </label>

              <label className="create-patient-field">
                <span>Telefone / WhatsApp</span>
                <input
                  type="text"
                  name="phone"
                  placeholder="(53) 99999-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone ? <small>{errors.phone}</small> : null}
              </label>

              <label className="create-patient-field">
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  placeholder="paciente@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email ? <small>{errors.email}</small> : null}
              </label>
            </div>
          </div>

          <div className="create-patient-form__section">
            <div className="create-patient-form__section-header">
              <h2>Fila inteligente</h2>
              <p>{content.queueDescription}</p>
            </div>

            <div className="create-patient-form__grid create-patient-form__grid--secondary">
              <label className="create-patient-field">
                <span>{content.statusLabel}</span>
                <select name="status" value={formData.status} onChange={handleChange}>
                  {patientStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="create-patient-field create-patient-field--full">
                <span>Especialidades de interesse</span>
                <div
                  className={`create-patient-specialties${errors.interests ? ' create-patient-specialties--error' : ''}`}
                  role="group"
                  aria-label="Especialidades de interesse"
                >
                  {specialtyOptions.map((specialty) => {
                    const isSelected = formData.interests.includes(specialty);

                    return (
                      <button
                        key={specialty}
                        type="button"
                        className={`create-patient-specialty-option${isSelected ? ' create-patient-specialty-option--selected' : ''}`}
                        onClick={() => handleToggleInterest(specialty)}
                        aria-pressed={isSelected}
                      >
                        {specialty}
                      </button>
                    );
                  })}
                </div>
                <small className="create-patient-field__hint">
                  Selecione uma ou mais especialidades para inserir o paciente na fila
                  inteligente.
                </small>
                {errors.interests ? <small>{errors.interests}</small> : null}
              </div>
            </div>
          </div>

          <aside className="create-patient-notice">
            <LuHeartPulse size={18} />
            <p>{content.notice}</p>
          </aside>

          <div className="create-patient-actions">
            <button
              type="button"
              className="create-patient-actions__button create-patient-actions__button--ghost"
              onClick={() => navigate('/patients')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-patient-actions__button create-patient-actions__button--primary"
            >
              <LuSave size={16} />
              {content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
