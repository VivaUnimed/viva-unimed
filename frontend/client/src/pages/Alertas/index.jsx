import "./styles.css";
import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";
import { useEffect, useRef, useState } from "react";

import {
  Search,
  Bell,
  TriangleAlert,
  ClipboardCheck,
  Droplets,
  FileCheck2,
  Clock3,
  ChevronRight,
} from "lucide-react";

export default function Alertas() {
  const contentRef = useRef(null);
  const [isCriticalHidden, setIsCriticalHidden] = useState(false);
  const [showCriticalHero, setShowCriticalHero] = useState(true);
  const [activeTab, setActiveTab] = useState("recentes");

  const tabs = [
    { key: "recentes", label: "Recentes" },
    { key: "vagas", label: "Vagas em tempo real" },
    { key: "exames", label: "Exames e relatorios" },
  ];

  useEffect(() => {
    const contentNode = contentRef.current;

    const handleScroll = (event) => {
      const currentScrollTop =
        event?.currentTarget === contentNode
          ? contentNode.scrollTop
          : window.scrollY;

      setIsCriticalHidden(currentScrollTop > 48);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    contentNode?.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      contentNode?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="alertas-page">
      <div className="alertas-card">

        {/* HEADER */}
        <header className="alertas-header">

          <div className="alertas-brand">

            <AppLogo size="small" />

          </div>

<button
          type="button"
          className={`alerta-toggle-btn ${showCriticalHero ? "on" : "off"}`}
          onClick={() => setShowCriticalHero((current) => !current)}
          aria-pressed={showCriticalHero}
        >
          Balão: {showCriticalHero ? "ON" : "OFF"}
        </button>

        <button className="alertas-search-btn">
          <Search size={18} />
        </button>

        </header>

        {/* CONTENT */}
        <main
          className={`alertas-content ${showCriticalHero ? "" : "hero-hidden"}`}
          ref={contentRef}
        >

          {/* HERO ALERT */}
          {showCriticalHero && (
            <section
              className={`alerta-hero ${
                isCriticalHidden ? "alerta-hero-hidden" : ""
              }`}
            >
              <div className="alerta-hero-top">
                <div className="alerta-dot"></div>
                <span>ALERTA</span>
              </div>

              <h1>Oportunidade Crítica</h1>

              <p>
                Vaga aberta agora em Cardiologia para hoje às 15:45.
                Expira em instantes.
              </p>

              <button className="alerta-hero-btn">
                Aceitar Vaga Agora
                <ChevronRight size={16} />
              </button>

              <div className="alerta-lightning"></div>
            </section>
          )}

          <section className="alertas-tabs" aria-label="Tipos de alertas">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`alertas-tab ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </section>

          {activeTab === "recentes" && (
          <>
          {/* SECTION TITLE */}
          <section className="alertas-section-title">

            <h3>Recentes</h3>

            <button>
              Marcar todas como lidas
            </button>

          </section>

          {/* ALERT LIST */}
          <section className="alertas-list">

            {/* ALERTA 1 */}
            <div className="alerta-item success">

              <div className="alerta-item-icon green">
                <Bell size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label green">
                    VAGA DISPONÍVEL
                  </span>

                  <small>Agora</small>
                </div>

                <h4>Cardiologia hoje às 15:45</h4>

                <p>
                  Uma nova vaga surgiu por cancelamento
                  na Unidade Litoral Sul.
                </p>

                <div className="alerta-actions">

                  <button className="btn-green">
                    Agendar
                  </button>

                  <button className="btn-gray">
                    Ignorar
                  </button>

                </div>

              </div>

            </div>

            {/* ALERTA 2 */}
            <div className="alerta-item">

              <div className="alerta-item-icon gray">
                <ClipboardCheck size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label gray">
                    CONFIRMAÇÃO
                  </span>

                  <small>2h atrás</small>
                </div>

                <h4>Confirmação de agendamento</h4>

                <p>
                  Seu check-up com Dr. Ricardo foi
                  confirmado para amanhã às 08:00.
                </p>

              </div>

            </div>

            {/* ALERTA 3 */}
            <div className="alerta-item warning">

              <div className="alerta-item-icon red">
                <TriangleAlert size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label red">
                    ATRASO NOTIFICADO
                  </span>

                  <small>4h atrás</small>
                </div>

                <h4>Atraso na Pediatria</h4>

                <p>
                  A unidade reporta 20 minutos de atraso
                  médio. Planeje sua chegada.
                </p>

              </div>

            </div>

            {/* ALERTA 4 */}
            <div className="alerta-item hidden-alerta">

              <div className="alerta-item-icon light">
                <Droplets size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label light">
                    DICA DE SAÚDE
                  </span>

                  <small>Ontem</small>
                </div>

                <h4>Hidratação e Exames</h4>

                <p>
                  Mantenha-se hidratado para o seu exame
                  de sangue de quinta-feira.
                </p>

              </div>

            </div>

            {/* ALERTA 5 */}
            <div className="alerta-item success hidden-alerta">

              <div className="alerta-item-icon green">
                <FileCheck2 size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label green">
                    RESULTADOS
                  </span>

                  <small>Ontem</small>
                </div>

                <h4>Exames laboratoriais prontos</h4>

                <p>
                  Seus resultados de Hemograma e Glicemia
                  já estão disponíveis no app.
                </p>

                <button className="alerta-link-btn">
                  Ver resultados ↗
                </button>

              </div>

            </div>

          </section>
          </>
          )}

          {activeTab === "vagas" && (
          <>
          {/* LIVE VACANCIES */}
          <section className="tempo-real-section">

            <div className="tempo-real-title">

              <div className="tempo-real-line"></div>

              <div>
                <h2>Vagas em Tempo Real</h2>

                <p>
                  As oportunidades expiram rapidamente.
                </p>
              </div>

            </div>

            {/* CARD */}
            <div className="vaga-card success">

              <div className="vaga-profile">

                <div className="vaga-profile-image"></div>

                <div>
                  <h4>Dra. Ana Silva</h4>
                  <span>CARDIOLOGIA</span>
                </div>

              </div>

              <div className="vaga-footer">

                <div className="vaga-time">

                  <small>HORÁRIO DISPONÍVEL</small>

                  <div>
                    <Clock3 size={16} />
                    <strong>15:45</strong>
                  </div>

                </div>

                <div className="vaga-buttons">

                  <button className="btn-accept">
                    Aceitar
                  </button>

                  <button className="btn-reject">
                    Recusar
                  </button>

                </div>

              </div>

            </div>

            {/* CARD */}
            <div className="vaga-card neutral">

              <div className="vaga-profile">

                <div className="vaga-profile-image"></div>

                <div>
                  <h4>Dr. Marcos Lima</h4>
                  <span>ORTOPEDIA</span>
                </div>

              </div>

              <div className="vaga-footer">

                <div className="vaga-time">

                  <small>HORÁRIO DISPONÍVEL</small>

                  <div>
                    <Clock3 size={16} />
                    <strong>15:45</strong>
                  </div>

                </div>

                <button className="btn-accept">
                  Aceite Rápido
                </button>

              </div>

            </div>

            {/* CARD */}
            <div className="vaga-card urgent">

              <div className="vaga-top-row">

                <div className="vaga-profile">

                  <div className="vaga-profile-image"></div>

                  <div>
                    <h4>Dra. Julia Costa</h4>
                    <span>PEDIATRIA</span>
                  </div>

                </div>

                <div className="vaga-tag">
                  URGENTE
                </div>

              </div>

              <div className="vaga-footer">

                <div className="vaga-time">

                  <small>HORÁRIO DISPONÍVEL</small>

                  <div>
                    <Clock3 size={16} />
                    <strong>16:30</strong>
                  </div>

                </div>

                <button className="btn-accept">
                  Aceite Rápido
                </button>

              </div>

            </div>

          </section>
          </>
          )}

          {activeTab === "exames" && (
          <>
          <section className="alertas-section-title">

            <h3>Exames e relatorios</h3>

            <button>
              Marcar todas como lidas
            </button>

          </section>

          <section className="alertas-list">

            <div className="alerta-item success">

              <div className="alerta-item-icon green">
                <FileCheck2 size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label green">
                    RESULTADOS
                  </span>

                  <small>Ontem</small>
                </div>

                <h4>Exames laboratoriais prontos</h4>

                <p>
                  Seus resultados de Hemograma e Glicemia
                  ja estao disponiveis no app.
                </p>

                <button className="alerta-link-btn">
                  Ver resultados
                </button>

              </div>

            </div>

            <div className="alerta-item">

              <div className="alerta-item-icon gray">
                <ClipboardCheck size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label gray">
                    RELATORIO
                  </span>

                  <small>2 dias atras</small>
                </div>

                <h4>Relatorio de consulta liberado</h4>

                <p>
                  O resumo da sua consulta com a endocrinologia
                  foi atualizado para revisao.
                </p>

                <button className="alerta-link-btn">
                  Abrir relatorio
                </button>

              </div>

            </div>

            <div className="alerta-item">

              <div className="alerta-item-icon light">
                <Droplets size={16} />
              </div>

              <div className="alerta-item-content">

                <div className="alerta-item-top">
                  <span className="alerta-label light">
                    DICA DE SAUDE
                  </span>

                  <small>Ontem</small>
                </div>

                <h4>Hidratacao e Exames</h4>

                <p>
                  Mantenha-se hidratado para o seu exame
                  de sangue de quinta-feira.
                </p>

              </div>

            </div>

          </section>
          </>
          )}

        </main>

        {/* NAVIGATION */}
        <AppNav className="alertas-bottom-nav" active="alertas" />

      </div>
    </div>
  );
}
