import { useNavigate, useParams } from 'react-router-dom';
import ProfessionalForm from '../../components/professionals/ProfessionalForm';
import ProfessionalNotFound from '../../components/professionals/ProfessionalNotFound';
import {
  getProfessionalFormInitialValues,
  getStoredProfessionals,
  updateMockProfessional,
} from '../../data/professionals';
import '../CreateProfessional/styles.css';

export default function EditProfessional() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const professionals = getStoredProfessionals();
  const professional = professionals.find(
    (currentProfessional) =>
      String(currentProfessional.id) === String(professionalId),
  );

  if (!professional) {
    return <ProfessionalNotFound />;
  }

  const handleSave = (formData) => {
    const updatedProfessional = updateMockProfessional(professionalId, formData);

    if (!updatedProfessional) {
      return;
    }

    navigate('/professionals', {
      state: {
        successMessage: `Profissional ${updatedProfessional.name} atualizado com sucesso.`,
      },
    });
  };

  return (
    <ProfessionalForm
      key={professional.id}
      variant="edit"
      initialValues={getProfessionalFormInitialValues(professional)}
      existingProfessionals={professionals}
      onSave={handleSave}
    />
  );
}
