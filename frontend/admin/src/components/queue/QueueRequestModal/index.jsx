import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import QueueModalShell from '../QueueModalShell';
import {
  formatQueueDateTime,
  getEligibleProfessionalsForSpecialty,
  getQueueStatusLabel,
} from '../../../data/queue';

const getCreateInitialState = (requestDatePreview) => ({
  patientId: '',
  specialityId: '',
  doctorId: '',
  status: 'waiting',
  date: requestDatePreview,
});

const getEditInitialState = (queueRequest, requestDatePreview) => ({
  patientId: String(queueRequest.patientId),
  specialityId: String(queueRequest.specialityId),
  doctorId: queueRequest.doctorId ? String(queueRequest.doctorId) : '',
  status: queueRequest.status,
  date: queueRequest.date ?? queueRequest.createdAt ?? requestDatePreview,
});

const getInitialFormState = ({
  isEditing,
  queueRequest,
  requestDatePreview,
}) => (
  isEditing && queueRequest
    ? getEditInitialState(queueRequest, requestDatePreview)
    : getCreateInitialState(requestDatePreview)
);

export default function QueueRequestModal({
  mode = 'create',
  queueRequest = null,
  patients = [],
  specialties = [],
  professionals = [],
  requestDatePreview = '',
  isSubmitting = false,
  onClose,
  onSave,
}) {
  const isEditing = mode === 'edit';
  const [formData, setFormData] = useState(() => getInitialFormState({
    isEditing,
    queueRequest,
    requestDatePreview,
  }));
  const [formError, setFormError] = useState('');

  const eligibleProfessionals = getEligibleProfessionalsForSpecialty(
    formData.specialityId,
    professionals,
  );
  const selectedDoctorId = eligibleProfessionals.some(
    (professional) => String(professional.id) === String(formData.doctorId),
  )
    ? formData.doctorId
    : '';

  const handleChange = (fieldName) => (event) => {
    const nextValue = event.target.value;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: nextValue,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.patientId || !formData.specialityId) {
      setFormError('Selecione o paciente e a especialidade para continuar.');
      return;
    }

    if (!formData.date) {
      setFormError('A entrada na fila precisa ter uma data válida.');
      return;
    }

    try {
      await onSave({
        patientId: Number(formData.patientId),
        specialityId: Number(formData.specialityId),
        doctorId: selectedDoctorId ? Number(selectedDoctorId) : null,
        status: isEditing ? formData.status : 'waiting',
        date: formData.date,
      });
    } catch (error) {
      setFormError(
        error?.message || 'Não foi possível salvar a solicitação da fila.',
      );
    }
  };

  return (
    <QueueModalShell
      title={isEditing ? 'Editar solicitação da fila' : 'Adicionar à fila'}
      description={
        isEditing
          ? 'Atualize a especialidade e o profissional preferido desta solicitação.'
          : 'Cadastre uma nova solicitação para acompanhamento da fila inteligente.'
      }
      className="queue-modal--form"
      onClose={onClose}
    >
      <form className="queue-form" onSubmit={handleSubmit}>
        {formError ? (
          <div className="queue-form__error" role="alert">
            <span>{formError}</span>
          </div>
        ) : null}

        {isEditing && queueRequest ? (
          <div className="queue-form__readonly-card">
            <span>Paciente</span>
            <strong>{queueRequest.patientName}</strong>
            <p>
              CPF: {queueRequest.patientCpfFormatted || 'Não informado'} •{' '}
              {queueRequest.patientPhoneFormatted || 'Telefone não informado'}
            </p>
          </div>
        ) : null}

        <div className="queue-form__grid">
          {!isEditing ? (
            <label className="queue-form__field">
              <span>Paciente</span>
              <div className="queue-form__select">
                <select
                  value={formData.patientId}
                  onChange={handleChange('patientId')}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                <LuChevronDown size={18} />
              </div>
            </label>
          ) : null}

          <label className="queue-form__field">
            <span>Especialidade de interesse</span>
            <div className="queue-form__select">
              <select
                value={formData.specialityId}
                onChange={handleChange('specialityId')}
                disabled={isSubmitting}
                required
              >
                <option value="">Selecione uma especialidade</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="queue-form__field">
            <span>Profissional preferido</span>
            <div className="queue-form__select">
              <select
                value={selectedDoctorId}
                onChange={handleChange('doctorId')}
                disabled={isSubmitting}
              >
                <option value="">Qualquer profissional</option>
                {eligibleProfessionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
              <LuChevronDown size={18} />
            </div>
          </label>

          <label className="queue-form__field">
            <span>Entrada na fila</span>
            <input
              type="text"
              value={formatQueueDateTime(formData.date)}
              readOnly
            />
          </label>

          <label className="queue-form__field">
            <span>{isEditing ? 'Status atual' : 'Status inicial'}</span>
            <div className="queue-form__readonly-value queue-form__readonly-value--status">
              <span
                className={`queue-status-badge queue-status-badge--${isEditing ? formData.status : 'waiting'}`}
              >
                {getQueueStatusLabel(isEditing ? formData.status : 'waiting')}
              </span>
            </div>
          </label>
        </div>

        <div className="queue-form__actions">
          <button
            type="button"
            className="queue-form__cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button type="submit" className="queue-form__submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Salvar na fila'}
          </button>
        </div>
      </form>
    </QueueModalShell>
  );
}
