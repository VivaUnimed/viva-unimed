import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalForm from '../../components/professionals/ProfessionalForm';
import { useProfessionals } from '../../context/professionalContext/professionalContext';
import { useSpecialties } from '../../context/specialtyContext/specialtyContext';
import './styles.css';

export default function CreateProfessional() {
  const navigate = useNavigate();
  const { createProfessional } = useProfessionals();
  const { specialtyState, getSpecialties } = useSpecialties();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        await getSpecialties();
      } catch {
        // O estado global já armazena a falha de carregamento.
      }
    };

    loadSpecialties();
  }, []);

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const professional = await createProfessional(formData);

      navigate('/professionals', {
        state: {
          successMessage: `Profissional ${professional.name} cadastrado com sucesso.`,
        },
      });
    } catch (error) {
      setSubmitError(
        error?.message || 'Não foi possível cadastrar o profissional.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfessionalForm
      variant="create"
      specialtyOptions={specialtyState.specialties}
      isLoadingSpecialties={specialtyState.isLoading}
      specialtiesError={specialtyState.error}
      onSave={handleSave}
      isSaving={isSubmitting}
      submitError={submitError}
    />
  );
}
