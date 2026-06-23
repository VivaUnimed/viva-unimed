import { LuChevronLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export default function PatientNotFound() {
  const navigate = useNavigate();

  return (
    <main className="patient-not-found-page">
      <section className="patient-not-found-card">
        <span className="patient-not-found-badge">Cadastro indisponível</span>
        <h1>Paciente não encontrado.</h1>
        <p>
          O paciente buscado não está disponível na listagem atual. Confira o link
          acessado ou retorne para a gestão de pacientes.
        </p>

        <button
          type="button"
          className="patient-not-found-button"
          onClick={() => navigate('/patients')}
        >
          <LuChevronLeft size={18} />
          Voltar para gestão de pacientes
        </button>
      </section>
    </main>
  );
}
