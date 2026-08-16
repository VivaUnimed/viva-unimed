import './styles.css';
import AppNav from '../../components/layouts/AppNav';
import AppLogo from '../../components/layouts/AppLogo';
import { CalendarDays, MapPin, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMinhasConsultas } from '../../api/consultasApi';

export default function MinhasConsultas() {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConsultas = async () => {
      try {
        const data = await getMinhasConsultas();
        setConsultas(data);
      } catch (error) {
        console.warn('Erro ao carregar consultas:', error.message);
        setConsultas([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultas();
  }, []);

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
            {isLoading ? (
              <p className="consultas-empty-state">Carregando consultas...</p>
            ) : consultas.length === 0 ? (
              <p className="consultas-empty-state">Nenhuma consulta encontrada</p>
            ) : (
              consultas.map((consulta) => (
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
              ))
            )}
          </section>

          {!isLoading && consultas.length > 0 && (
            <div className="consultas-end-text">FIM DA LISTA</div>
          )}
        </main>

        <AppNav className="consultas-bottom-nav" active="home" />
      </div>
    </div>
  );
}
