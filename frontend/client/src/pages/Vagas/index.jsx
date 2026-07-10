import "./styles.css";
import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";

import {
  Search,
  Clock3,
} from "lucide-react";

export default function VagasDisponiveis() {
  return (
    <div className="vagas-page">
      <div className="vagas-card">

        {/* HEADER */}
        <header className="vagas-header">

          <div className="vagas-brand">
            <AppLogo size="small" />
          </div>

          <button className="vagas-search-btn">
            <Search size={20} />
          </button>

        </header>

        {/* CONTENT */}
        <main className="vagas-content">

          {/* TITLE */}
          <section className="vagas-title-group">

            <div className="vagas-title-line"></div>

            <div>
              <h1>Vagas em Tempo Real</h1>

              <p>
                As oportunidades expiram rapidamente.
                Aceite agora para garantir o horário.
              </p>
            </div>

          </section>

          {/* LIST */}
          <section className="vagas-list">

            {/* CARD 1 */}
            <div className="vaga-item success">

              <div className="vaga-top">

                <div className="vaga-profile">
                  <div className="vaga-profile-image"></div>

                  <div>
                    <h3>Dra. Ana Silva</h3>
                    <span>CARDIOLOGIA</span>
                  </div>
                </div>

              </div>

              <div className="vaga-bottom">

                <div className="vaga-time">
                  <small>HORÁRIO DISPONÍVEL</small>

                  <div className="vaga-time-row">
                    <Clock3 size={18} />
                    <strong>14:15</strong>
                  </div>
                </div>

                <button className="vaga-button">
                  Aceite Rápido
                </button>

              </div>

            </div>

            {/* CARD 2 */}
            <div className="vaga-item neutral">

              <div className="vaga-top">

                <div className="vaga-profile">
                  <div className="vaga-profile-image"></div>

                  <div>
                    <h3>Dr. Marcos Lima</h3>
                    <span>ORTOPEDIA</span>
                  </div>
                </div>

              </div>

              <div className="vaga-bottom">

                <div className="vaga-time">
                  <small>HORÁRIO DISPONÍVEL</small>

                  <div className="vaga-time-row">
                    <Clock3 size={18} />
                    <strong>15:45</strong>
                  </div>
                </div>

                <button className="vaga-button">
                  Aceite Rápido
                </button>

              </div>

            </div>

            {/* CARD 3 */}
            <div className="vaga-item urgent">

              <div className="vaga-top">

                <div className="vaga-profile">

                  <div className="vaga-profile-image"></div>

                  <div>
                    <h3>Dr. Julia Costa</h3>
                    <span>PEDIATRIA</span>
                  </div>

                </div>

                <div className="vaga-tag">
                  URGENTE
                </div>

              </div>

              <div className="vaga-bottom">

                <div className="vaga-time">
                  <small>HORÁRIO DISPONÍVEL</small>

                  <div className="vaga-time-row">
                    <Clock3 size={18} />
                    <strong>16:30</strong>
                  </div>
                </div>

                <button className="vaga-button">
                  Aceite Rápido
                </button>

              </div>

            </div>

          </section>

        </main>

        {/* BOTTOM NAV */}
        <AppNav className="vagas-bottom-nav" active="alertas" />

      </div>
    </div>
  );
}
