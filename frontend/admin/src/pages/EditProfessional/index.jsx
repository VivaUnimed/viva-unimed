import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfessionalForm from '../../components/professionals/ProfessionalForm';
import ProfessionalNotFound from '../../components/professionals/ProfessionalNotFound';
import {
  getProfessionalFormInitialValues,
  getProfessionalSpecialtyOptions,
  mergeProfessionalWithUser,
} from '../../data/professionals';
import { useProfessionals } from '../../context/professionalContext/professionalContext';
import { useSpecialties } from '../../context/specialtyContext/specialtyContext';
import { getUserById } from '../../api/userApi';
import '../CreateProfessional/styles.css';

export default function EditProfessional() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const { professionalState, getProfessionalById, updateProfessional } = useProfessionals();
  const { specialtyState, getSpecialties } = useSpecialties();
  const cachedProfessional = professionalState.professionals.find(
    (currentProfessional) =>
      String(currentProfessional.id) === String(professionalId),
  );
  const [professional, setProfessional] = useState(cachedProfessional ?? null);
  const [isLoading, setIsLoading] = useState(!cachedProfessional);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFormDependencies = async () => {
      if (!cachedProfessional) {
        setIsLoading(true);
      }
      setSubmitError('');

      try {
        const [doctor, user] = await Promise.all([
          getProfessionalById(professionalId),
          getUserById(professionalId),
        ]);

        try {
          await getSpecialties();
        } catch {
          // A falha das opções de especialidade continua visível em specialtyState.error.
        }

        if (!isMounted) {
          return;
        }

        setProfessional(mergeProfessionalWithUser(doctor, user));
        setIsNotFound(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error?.message === 'NotFound') {
          setIsNotFound(true);
          setProfessional(null);
          return;
        }

        setSubmitError(
          error?.message || 'Não foi possível carregar o profissional para edição.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFormDependencies();

    return () => {
      isMounted = false;
    };
  }, [cachedProfessional, professionalId]);

  if (isLoading) {
    return (
      <main className="professional-details-page">
        <section className="professional-details-card">
          <p className="professional-details-message">Carregando profissional...</p>
        </section>
      </main>
    );
  }

  if (isNotFound) {
    return <ProfessionalNotFound />;
  }

  if (!professional && submitError) {
    return (
      <main className="professional-details-page">
        <section className="professional-details-card">
          <p className="professional-details-message">{submitError}</p>
        </section>
      </main>
    );
  }

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const updatedProfessional = await updateProfessional(formData, professional);

      navigate('/professionals', {
        state: {
          successMessage: `Profissional ${updatedProfessional.name} atualizado com sucesso.`,
        },
      });
    } catch (error) {
      setSubmitError(
        error?.message || 'Não foi possível atualizar o profissional.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfessionalForm
      key={professional?.id ?? professionalId}
      variant="edit"
      initialValues={getProfessionalFormInitialValues(professional)}
      specialtyOptions={getProfessionalSpecialtyOptions(
        specialtyState.specialties,
        professional?.specialities,
      )}
      isLoadingSpecialties={specialtyState.isLoading}
      specialtiesError={specialtyState.error}
      onSave={handleSave}
      isSaving={isSubmitting}
      submitError={submitError}
    />
  );
}
