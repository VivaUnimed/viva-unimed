import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LuCalendarDays,
  LuChevronLeft,
  LuChevronDown,
  LuClock3,
  LuMapPin,
  LuMoveRight,
} from 'react-icons/lu';
import './styles.css';

const professionals = [
  'Dra. Mariana Lopes',
  'Dr. Ricardo Almeida',
  'Dra. Heloisa Santos',
];

const specialties = ['Cardiologia', 'Ortopedia', 'Pediatria'];

const units = ['Unidade Centro', 'Unidade Zona Sul', 'Unidade Norte'];

const vacancyTypes = [
  'No-show',
  'Cancelamento',
  'Desistência',
  'Horário ocioso',
  'Remanejamento',
  'Outro',
];

const expirationOptions = [
  '5 minutos',
  '10 minutos',
  '15 minutos',
  '30 minutos',
  'Personalizado',
];

export default function NoShowRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const vacancyDateInputRef = useRef(null);
  const vacancyTimeInputRef = useRef(null);
  const returnTo = typeof location.state?.returnTo === 'string'
    ? location.state.returnTo
    : '/vacancies';
  const returnLabel = typeof location.state?.returnLabel === 'string'
    ? location.state.returnLabel
    : 'vagas';
  const prefilledDate = typeof location.state?.date === 'string' ? location.state.date : '';
  const prefilledTime = typeof location.state?.time === 'string' ? location.state.time : '';

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
            Preencha as informações para registrar uma disponibilidade e
            acionar a fila inteligente.
          </p>
        </div>
      </section>

      <section className="no-show-registration-card">
        <form
          className="no-show-registration-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="no-show-registration-field no-show-registration-field--full">
            <span>Profissional de Saúde</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select defaultValue="">
                <option value="" disabled>
                  Selecione o profissional
                </option>
                {professionals.map((professional) => (
                  <option key={professional} value={professional}>
                    {professional}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="no-show-registration-field no-show-registration-field--full">
            <span>Especialidade</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select defaultValue="">
                <option value="" disabled>
                  Selecione a especialidade
                </option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="no-show-registration-field">
            <span>Unidade</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select defaultValue="">
                <option value="" disabled>
                  Selecione a unidade
                </option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <LuMapPin
                size={17}
                className="no-show-registration-input__icon no-show-registration-input__icon--aux"
              />
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="no-show-registration-field">
            <span>Data da Vaga</span>
            <div
              className="no-show-registration-input no-show-registration-input--picker"
              onClick={() => openNativePicker(vacancyDateInputRef.current)}
            >
              <input ref={vacancyDateInputRef} type="date" defaultValue={prefilledDate} />
              <LuCalendarDays
                size={18}
                className="no-show-registration-input__icon"
              />
            </div>
          </label>

          <label className="no-show-registration-field">
            <span>Horário Específico</span>
            <div
              className="no-show-registration-input no-show-registration-input--picker"
              onClick={() => openNativePicker(vacancyTimeInputRef.current)}
            >
              <input ref={vacancyTimeInputRef} type="time" defaultValue={prefilledTime} />
              <LuClock3
                size={18}
                className="no-show-registration-input__icon"
              />
            </div>
          </label>

          <label className="no-show-registration-field">
            <span>Tipo de Vaga</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select defaultValue="No-show">
                {vacancyTypes.map((vacancyType) => (
                  <option key={vacancyType} value={vacancyType}>
                    {vacancyType}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="no-show-registration-field no-show-registration-field--full">
            <span>Tempo de Expiração da Oferta</span>
            <div className="no-show-registration-input no-show-registration-input--select">
              <select defaultValue="15 minutos" required>
                {expirationOptions.map((expirationOption) => (
                  <option key={expirationOption} value={expirationOption}>
                    {expirationOption}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <div className="no-show-registration-actions">
            <button type="submit" className="no-show-registration-submit">
              Cadastrar vaga e processar fila
              <LuMoveRight size={18} />
            </button>

            <p>
              Após o cadastro, a vaga será enviada para pacientes elegíveis na
              fila da especialidade.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
