import { LuChevronLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export default function ProfessionalNotFound() {
  const navigate = useNavigate();

  return (
    <main className="professional-not-found-page">
      <section className="professional-not-found-card">
        <span className="professional-not-found-badge">Cadastro indisponível</span>
        <h1>Profissional não encontrado.</h1>
        <p>
          O profissional buscado não está disponível na listagem atual. Confira o
          link acessado ou retorne para a gestão de profissionais.
        </p>

        <button
          type="button"
          className="professional-not-found-button"
          onClick={() => navigate('/professionals')}
        >
          <LuChevronLeft size={18} />
          Voltar para gestão de profissionais
        </button>
      </section>
    </main>
  );
}
