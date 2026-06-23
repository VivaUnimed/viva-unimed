import './styles.css';
import AppNav from '../../components/layouts/AppNav';
import AppLogo from '../../components/layouts/AppLogo';
import { CalendarDays, MapPin, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const consultas = [
  {
    id: 'ana-silva',
    especialidade: 'CARDIOLOGIA',
    status: 'VAGA ACEITA',
    statusVariant: 'light-green',
    medico: 'Dra. Ana Silva',
    dataResumo: 'Hoje, 14:15',
    local: 'Unidade Litoral Sul',
  },
  {
    id: 'amanda-costa',
    especialidade: 'DERMATOLOGIA',
    status: 'CONFIRMADO',
    statusVariant: 'gray',
    medico: 'Dra. Amanda Costa',
    dataResumo: 'Amanha, 09:30',
    local: 'Unidade Litoral Sul',
  },
  {
    id: 'marcos-lima',
    especialidade: 'ORTOPEDIA',
    status: 'CONFIRMADO',
    statusVariant: 'gray',
    medico: 'Dr. Marcos Lima',
    dataResumo: '24 de Out, 15:40',
    local: 'Unidade Central',
  },
];

export default function MinhasConsultas() {
  const navigate = useNavigate();

  return (
    <div className="consultas-page">
      <div className="consultas-card">
        <header className="consultas-header">
          <button
            type="button"
            className="consultas-menu-btn"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <div className="consultas-brand">
            <AppLogo size="small" />
          </div>

          <div className="consultas-avatar"></div>
        </header>

        <main className="consultas-content">
          <section className="consultas-title-group">
            <h2>Minhas Consultas</h2>

            <p>Acompanhe seus proximos atendimentos</p>
          </section>

          <section className="consultas-list">
            {consultas.map((consulta) => (
              <div className="consulta-item" key={consulta.id}>
                <div className="consulta-top-tags">
                  <span className="consulta-tag green">
                    {consulta.especialidade}
                  </span>

                  <span className={`consulta-tag ${consulta.statusVariant}`}>
                    {consulta.status}
                  </span>
                </div>

                <div className="consulta-main">
                  <div>
                    <h3>{consulta.medico}</h3>

                    <div className="consulta-info">
                      <CalendarDays size={14} />
                      <span>{consulta.dataResumo}</span>
                    </div>

                    <div className="consulta-info">
                      <MapPin size={14} />
                      <span>{consulta.local}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="consulta-details-btn"
                    onClick={() => navigate(`/consultas-detalhes/${consulta.id}`)}
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))}
          </section>

          <div className="consultas-end-text">FIM DA LISTA</div>
        </main>

        <AppNav className="consultas-bottom-nav" active="home" />
      </div>
    </div>
  );
}
