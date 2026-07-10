import './styles.css';
import AppNav from '../../components/layouts/AppNav';
import AppLogo from '../../components/layouts/AppLogo';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Map,
  MapPin,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const consultasDetalhes = {
  'ana-silva': {
    medico: 'Dra. Ana Silva',
    especialidade: 'Cardiologia',
    data: 'Hoje',
    hora: '14:15',
    local: 'Unidade Litoral Sul',
  },
  'amanda-costa': {
    medico: 'Dra. Amanda Costa',
    especialidade: 'Dermatologia',
    data: 'Amanha',
    hora: '09:30',
    local: 'Unidade Litoral Sul',
  },
  'marcos-lima': {
    medico: 'Dr. Marcos Lima',
    especialidade: 'Ortopedia',
    data: '24 de out',
    hora: '15:40',
    local: 'Unidade Central',
  },
};

export default function ConsultaDetalhes() {
  const navigate = useNavigate();
  const { consultaId } = useParams();
  const consulta =
    consultasDetalhes[consultaId] || consultasDetalhes['marcos-lima'];

  return (
    <div className="consulta-detalhes-page">
      <div className="consulta-detalhes-card">
        <header className="consulta-detalhes-header">
          <div className="consulta-detalhes-brand">
            <AppLogo size="small" />
          </div>

          <div className="consulta-detalhes-avatar"></div>
        </header>

        <div className="consulta-detalhes-background"></div>

        <main className="consulta-modal">
          <button
            type="button"
            className="consulta-close-btn"
            onClick={() => navigate('/consultas')}
          >
            <X size={22} />
          </button>

          <section className="consulta-modal-top">
            <div className="consulta-doctor-image"></div>

            <div className="consulta-doctor-info">
              <small>ESPECIALIDADE</small>

              <h2>{consulta.medico}</h2>

              <span>{consulta.especialidade}</span>
            </div>
          </section>

          <section className="consulta-info-grid">
            <div className="consulta-info-box">
              <div className="consulta-info-title">
                <Calendar size={14} />
                <span>DATA</span>
              </div>

              <strong>{consulta.data}</strong>
            </div>

            <div className="consulta-info-box">
              <div className="consulta-info-title">
                <Clock3 size={14} />
                <span>HORA</span>
              </div>

              <strong>{consulta.hora}</strong>
            </div>
          </section>

          <section className="consulta-location-box">
            <div>
              <div className="consulta-info-title">
                <MapPin size={14} />
                <span>LOCALIZACAO</span>
              </div>

              <h3>{consulta.local}</h3>
            </div>

            <button type="button" className="consulta-map-btn">
              <Map size={18} />
            </button>
          </section>

          <section className="consulta-actions">
            <button type="button" className="consulta-confirm-btn">
              <CheckCircle2 size={18} />
              Confirmar Presenca
            </button>

            <button type="button" className="consulta-preparo-btn">
              <ClipboardList size={18} />
              Orientacoes de Preparo
            </button>

            <button type="button" className="consulta-cancel-btn">
              Cancelar Consulta
            </button>
          </section>
        </main>

        <AppNav className="consulta-bottom-nav" active="home" />
      </div>
    </div>
  );
}
