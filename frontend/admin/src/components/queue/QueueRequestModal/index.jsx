import { useEffect, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import QueueModalShell from '../QueueModalShell';
import {
  formatQueueDateTime,
  getEligibleProfessionalsForSpecialty,
  getQueueStatusLabel,
  queueStatusOptions,
} from '../../../data/queue';

const getCreateInitialState = (createdAtPreview) => ({
  patientId: '',
  specialityId: '',
  doctorId: '',
  status: 'waiting',
  createdAt: createdAtPreview,
});

export default function QueueRequestModal({
  mode = 'create',
  queueRequest = null,
  patients = [],
  specialties = [],
  professionals = [],
  createdAtPreview = '',
  onClose,
  onSave,
}) {
  const isEditing = mode === 'edit';
  const [formData, setFormData] = useState(() => getCreateInitialState(createdAtPreview));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEditing && queueRequest) {
      setFormData({
        patientId: String(queueRequest.patientId),
        specialityId: String(queueRequest.specialityId),
        doctorId: queueRequest.doctorId ? String(queueRequest.doctorId) : '',
        status: queueRequest.status,
        createdAt: queueRequest.createdAt,
      });
      setFormError('');
      return;
    }

    setFormData(getCreateInitialState(createdAtPreview));
    setFormError('');
  }, [createdAtPreview, isEditing, queueRequest]);

  const eligibleProfessionals = getEligibleProfessionalsForSpecialty(
    formData.specialityId,
    professionals,
  );

  useEffect(() => {
    if (!formData.doctorId) {
      return;
    }

    const professionalStillAvailable = eligibleProfessionals.some(
      (professional) => String(professional.id) === String(formData.doctorId),
    );

    if (professionalStillAvailable) {
      return;
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      doctorId: '',
    }));
  }, [eligibleProfessionals, formData.doctorId]);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.patientId || !formData.specialityId) {
      setFormError('Selecione o paciente e a especialidade para continuar.');
      return;
    }

    onSave({
      patientId: Number(formData.patientId),
      specialityId: Number(formData.specialityId),
      doctorId: formData.doctorId ? Number(formData.doctorId) : null,
      status: isEditing ? formData.status : 'waiting',
      createdAt: formData.createdAt,
    });
  };

  return (
    <QueueModalShell
      title={isEditing ? 'Editar solicitação da fila' : 'Adicionar à fila'}
      description={
        isEditing
          ? 'Atualize a especialidade, o profissional preferido e o status desta solicitação.'
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
                <select value={formData.patientId} onChange={handleChange('patientId')} required>
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
              <select value={formData.doctorId} onChange={handleChange('doctorId')}>
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
              value={formatQueueDateTime(formData.createdAt)}
              readOnly
            />
          </label>

          {isEditing ? (
            <label className="queue-form__field">
              <span>Status</span>
              <div className="queue-form__select">
                <select value={formData.status} onChange={handleChange('status')}>
                  {queueStatusOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <LuChevronDown size={18} />
              </div>
            </label>
          ) : (
            <div className="queue-form__status-preview">
              <span>Status inicial</span>
              <strong>{getQueueStatusLabel('waiting')}</strong>
            </div>
          )}
        </div>

        <div className="queue-form__actions">
          <button
            type="button"
            className="queue-form__cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button type="submit" className="queue-form__submit">
            {isEditing ? 'Salvar alterações' : 'Salvar na fila'}
          </button>
        </div>
      </form>
    </QueueModalShell>
  );
}
