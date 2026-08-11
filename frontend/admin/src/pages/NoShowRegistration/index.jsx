import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LuBadgeAlert,
  LuCalendarDays,
  LuChevronDown,
  LuChevronLeft,
  LuClock3,
  LuMoveRight,
} from 'react-icons/lu';
import { useProfessionals } from '../../context/professionalContext/professionalContext';
import { useSpecialties } from '../../context/specialtyContext/specialtyContext';
import { useVacancies } from '../../context/vacancyContext/vacancyContext';
import './styles.css';

const getProfessionalOptionLabel = (professional) => {
  const statusSuffix = professional.status === 'Inativo' ? ' • Inativo' : '';
  const crmSuffix = professional.crm ? ` • CRM ${professional.crm}` : '';

  return `${professional.name}${crmSuffix}${statusSuffix}`;
};

export default function NoShowRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { professionalState, getProfessionals } = useProfessionals();
  const { specialtyState, getSpecialties } = useSpecialties();
  const { createVacancy } = useVacancies();
  const vacancyDateInputRef = useRef(null);
  const vacancyTimeInputRef = useRef(null);
  const hasLoadedDependenciesRef = useRef(false);
  const returnTo = typeof location.state?.returnTo === 'string'
    ? location.state.returnTo
    : '/vacancies';
  const returnLabel = typeof location.state?.returnLabel === 'string'
    ? location.state.returnLabel
    : 'vagas';
  const prefilledDate = typeof location.state?.date === 'string' ? location.state.date : '';
  const prefilledTime = typeof location.state?.time === 'string' ? location.state.time : '';
  const [formValues, setFormValues] = useState({
    doctorId: '',
    specialityId: '',
    date: prefilledDate,
    time: prefilledTime,
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasLoadedDependenciesRef.current) {
      return;
    }

    hasLoadedDependenciesRef.current = true;

    const loadDependencies = async () => {
      try {
        await Promise.all([
          getProfessionals(),
          getSpecialties(),
        ]);
      } catch {
        // Os erros de dependência permanecem visíveis nos estados globais.
      }
    };

    loadDependencies();
  }, [getProfessionals, getSpecialties]);

  const selectedProfessional = professionalState.professionals.find(
    (professional) => String(professional.id) === String(formValues.doctorId),
  );
  const availableSpecialties = selectedProfessional
    ? specialtyState.specialties.filter((specialty) => (
      selectedProfessional.specialityIds.includes(Number(specialty.id))
    ))
    : specialtyState.specialties;
  const dependencyError = professionalState.error || specialtyState.error;
  const isLoadingDependencies = professionalState.isLoading || specialtyState.isLoading;
  const isSubmitDisabled = (
    isSubmitting
    || isLoadingDependencies
    || !formValues.doctorId
    || !formValues.specialityId
    || !formValues.date
    || !formValues.time
    || !availableSpecialties.length
  );

  useEffect(() => {
    if (!formValues.specialityId) {
      return;
    }

    const hasSelectedSpecialty = availableSpecialties.some(
      (specialty) => String(specialty.id) === String(formValues.specialityId),
    );

    if (!hasSelectedSpecialty) {
      setFormValues((currentValues) => ({
        ...currentValues,
        specialityId: '',
      }));
    }
  }, [availableSpecialties, formValues.specialityId]);

  const openNativePicker = (input) => {
    if (!input) {
      return;
    }

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const handleBackNavigation = () => {
    if (typeof location.state?.returnTo === 'string') {
      navigate(-1);
      return;
    }

    navigate(returnTo);
  };

  const handleChange = (fieldName) => (event) => {
    const { value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
      ...(fieldName === 'doctorId' ? { specialityId: '' } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const createdVacancy = await createVacancy(formValues);

      navigate('/vacancies', {
        state: {
          successMessage: `Vaga #${createdVacancy.id} cadastrada com sucesso.`,
        },
      });
    } catch (error) {
      setSubmitError(error?.message || 'Não foi possível cadastrar a vaga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="no-show-registration-page">
      <section className="no-show-registration-header">
        <div>
          <button
            type="button"
            className="no-show-registration-back-button"
            onClick={handleBackNavigation}
          >
            <LuChevronLeft size={20} />
            Voltar para {returnLabel}
          </button>
          <h1>Nova Vaga Remanescente</h1>
          <p>
            Preencha os dados atualmente aceitos pelo backend para registrar uma vaga.
          </p>
        </div>
      </section>

      <section className="no-show-registration-card">
        {dependencyError ? (
          <div className="no-show-registration-feedback" role="alert">
            <LuBadgeAlert size={18} />
            <span>{dependencyError}</span>
          </div>
        ) : null}

        {submitError ? (
          <div className="no-show-registration-feedback" role="alert">
            <LuBadgeAlert size={18} />
            <span>{submitError}</span>
          </div>
        ) : null}

        <form
          className="no-show-registration-form"
          onSubmit={handleSubmit}
        >
          <label className="no-show-registration-field no-show-registration-field--full">
            <span>Profissional de Saúde</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select
                value={formValues.doctorId}
                onChange={handleChange('doctorId')}
                disabled={isLoadingDependencies || !professionalState.professionals.length}
                required
              >
                <option value="" disabled>
                  {isLoadingDependencies
                    ? 'Carregando profissionais...'
                    : 'Selecione o profissional'}
                </option>
                {professionalState.professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {getProfessionalOptionLabel(professional)}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="no-show-registration-field no-show-registration-field--full">
            <span>Especialidade</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select
                value={formValues.specialityId}
                onChange={handleChange('specialityId')}
                disabled={isLoadingDependencies || !availableSpecialties.length}
                required
              >
                <option value="" disabled>
                  {selectedProfessional && !availableSpecialties.length
                    ? 'Profissional sem especialidades vinculadas'
                    : isLoadingDependencies
                      ? 'Carregando especialidades...'
                      : 'Selecione a especialidade'}
                </option>
                {availableSpecialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
            {selectedProfessional && !availableSpecialties.length ? (
              <small className="no-show-registration-helper">
                O profissional selecionado não possui vínculo de especialidade disponível.
              </small>
            ) : null}
          </label>

          <label className="no-show-registration-field">
            <span>Data da Vaga</span>
            <div
              className="no-show-registration-input no-show-registration-input--picker"
              onClick={() => openNativePicker(vacancyDateInputRef.current)}
            >
              <input
                ref={vacancyDateInputRef}
                type="date"
                value={formValues.date}
                onChange={handleChange('date')}
                required
              />
              <LuCalendarDays
                size={18}
                className="no-show-registration-input__icon"
              />
            </div>
          </label>

          <label className="no-show-registration-field">
            <span>Horário da Vaga</span>
            <div
              className="no-show-registration-input no-show-registration-input--picker"
              onClick={() => openNativePicker(vacancyTimeInputRef.current)}
            >
              <input
                ref={vacancyTimeInputRef}
                type="time"
                value={formValues.time}
                onChange={handleChange('time')}
                required
              />
              <LuClock3
                size={18}
                className="no-show-registration-input__icon"
              />
            </div>
          </label>

          <div className="no-show-registration-actions">
            <button
              type="submit"
              className="no-show-registration-submit"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? 'Cadastrando vaga...' : 'Cadastrar vaga'}
              <LuMoveRight size={18} />
            </button>

            <p>
              Após o cadastro, o processamento da fila continua seguindo a automação
              atual do backend.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
