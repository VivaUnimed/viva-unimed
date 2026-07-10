import { useNavigate } from 'react-router-dom';
import ProfessionalForm from '../../components/professionals/ProfessionalForm';
import {
  createMockProfessional,
  getStoredProfessionals,
} from '../../data/professionals';
import './styles.css';

export default function CreateProfessional() {
  const navigate = useNavigate();
  const professionals = getStoredProfessionals();

  const handleSave = (formData) => {
    const professional = createMockProfessional(formData);

    navigate('/professionals', {
      state: {
        successMessage: `Profissional ${professional.name} cadastrado com sucesso.`,
      },
    });
  };

  return (
    <ProfessionalForm
      variant="create"
      existingProfessionals={professionals}
      onSave={handleSave}
    />
  );
}
