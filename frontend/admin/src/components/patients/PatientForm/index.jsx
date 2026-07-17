import { useState } from 'react';
import {
  LuChevronLeft,
  LuPencilLine,
  LuSave,
  LuUserRoundPlus,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import {
  isPhoneValid,
} from '../../../utils/patients/patientFormatters';
import '../../../pages/CreatePatient/styles.css';

const defaultFormState = {
  name: '',
  cpf: '',
  phone: '',
  email: '',
  birth: '',
};

const formContentByVariant = {
  create: {
    badgeIcon: LuUserRoundPlus,
    badgeLabel: 'Novo paciente',
    title: 'Cadastrar paciente',
    description:
      'Preencha os dados administrativos do paciente para concluir o cadastro no sistema.',
    notice:
      'Após o cadastro, o paciente passa a aparecer imediatamente na gestão de pacientes.',
    submitLabel: 'Salvar paciente',
  },
  edit: {
    badgeIcon: LuPencilLine,
    badgeLabel: 'Editar paciente',
    title: 'Editar paciente',
    description:
      'Atualize os dados administrativos do paciente com base no cadastro já existente.',
    notice:
      'As alterações ficam disponíveis imediatamente na gestão de pacientes.',
    submitLabel: 'Salvar alterações',
  },
};

const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

export default function PatientForm({
  variant = 'create',
  initialValues = defaultFormState,
  onSave,
  isSubmitting = false,
  submitError = '',
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({
    ...defaultFormState,
    ...initialValues,
    birth: initialValues.birth ?? '',
  }));
  const [errors, setErrors] = useState({});
  const content = formContentByVariant[variant] ?? formContentByVariant.create;
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

  const validateForm = () => {
    const nextErrors = {};
    const trimmedCpf = formData.cpf.trim();
    const trimmedPhone = formData.phone.trim();
    const cpfDigits = trimmedCpf.replace(/\D/g, '');
    const isCpfValid =
      variant === 'edit'
        ? !trimmedCpf || cpfDigits.length === 11
        : cpfDigits.length === 11;
    const canKeepCurrentPhone = variant === 'edit' && trimmedPhone === initialValues.phone?.trim();
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

    if (!formData.birth) {
      nextErrors.birth = 'Informe a data de nascimento do paciente.';
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

    const normalizedFormData = {
      name: formData.name.trim(),
      cpf: formData.cpf.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      birth: formData.birth,
    };

    await onSave?.(normalizedFormData);
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

              <label className="create-patient-field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  name="birth"
                  value={formData.birth}
                  onChange={handleChange}
                />
                {errors.birth ? <small>{errors.birth}</small> : null}
              </label>
            </div>
          </div>

          {submitError ? (
            <div className="create-patient-feedback create-patient-feedback--error" role="alert">
              <p>{submitError}</p>
            </div>
          ) : null}

          <div className="create-patient-actions">
            <button
              type="button"
              className="create-patient-actions__button create-patient-actions__button--ghost"
              onClick={() => navigate('/patients')}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-patient-actions__button create-patient-actions__button--primary"
              disabled={isSubmitting}
            >
              <LuSave size={16} />
              {isSubmitting ? 'Salvando...' : content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
