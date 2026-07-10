import "./styles.css";
import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";
import { createElement, useState } from "react";

import {
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
  Plus,
  Minus,
  Zap,
  Bone,
  Brain,
  Eye as EyeIcon,
  Smile,
  Activity,
  Syringe,
  Ear,
  ScanHeart,
  CirclePlus,
} from "lucide-react";

const featuredInterests = [
  {
    id: "cardiologia",
    name: "Cardiologia",
    status: "3 VAGAS HOJE",
    Icon: HeartPulse,
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    status: "ALTA DEMANDA",
    Icon: Stethoscope,
  },
  {
    id: "pediatria",
    name: "Pediatria",
    status: "DISPONIVEL",
    Icon: Baby,
  },
];

const specialtyInterests = [
  { id: "gastroenterologia", name: "Gastroenterologia", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "dermatologia", name: "Dermatologia", status: "ESPECIALIDADE", Icon: Smile },
  { id: "neurologia", name: "Neurologia", status: "ESPECIALIDADE", Icon: Brain },
  { id: "oftalmologia", name: "Oftalmologia", status: "ESPECIALIDADE", Icon: EyeIcon },
  { id: "endocrinologia", name: "Endocrinologia", status: "ESPECIALIDADE", Icon: Activity },
  { id: "ginecologia", name: "Ginecologia", status: "ESPECIALIDADE", Icon: Syringe },
  { id: "otorrinolaringologia", name: "Otorrinolaringologia", status: "ESPECIALIDADE", Icon: Ear },
  { id: "reumatologia", name: "Reumatologia", status: "ESPECIALIDADE", Icon: Bone },
  { id: "urologia", name: "Urologia", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "psiquiatria", name: "Psiquiatria", status: "ESPECIALIDADE", Icon: Brain },
  { id: "pneumologia", name: "Pneumologia", status: "ESPECIALIDADE", Icon: ScanHeart },
  { id: "cirurgia-geral", name: "Cirurgia Geral", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "oncologia", name: "Oncologia", status: "ESPECIALIDADE", Icon: HeartPulse },
  { id: "nefrologia", name: "Nefrologia", status: "ESPECIALIDADE", Icon: Syringe },
  { id: "hepatologia", name: "Hepatologia", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "alergologia", name: "Alergologia", status: "ESPECIALIDADE", Icon: Activity },
  { id: "imunologia", name: "Imunologia", status: "ESPECIALIDADE", Icon: Bone },
  { id: "hematologia", name: "Hematologia", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "geriatria", name: "Geriatria", status: "ESPECIALIDADE", Icon: HeartPulse },
  { id: "cirurgia-plastica", name: "Cirurgia Plástica", status: "ESPECIALIDADE", Icon: Smile },
  { id: "radiologia", name: "Radiologia", status: "ESPECIALIDADE", Icon: ScanHeart },
  { id: "patologia", name: "Patologia", status: "ESPECIALIDADE", Icon: Brain },
  { id: "medicina-interna", name: "Medicina Interna", status: "ESPECIALIDADE", Icon: Stethoscope },
  { id: "medicina-do-trabalho", name: "Medicina do Trabalho", status: "ESPECIALIDADE", Icon: Activity },
  { id: "medicina-familia", name: "Medicina de Família", status: "ESPECIALIDADE", Icon: HeartPulse },
  { id: "cardiologia-intervencao", name: "Cardiologia Intervencão", status: "ESPECIALIDADE", Icon: ScanHeart },
  { id: "infectologia", name: "Infectologia", status: "ESPECIALIDADE", Icon: Syringe },
  { id: "ortopedia-pediatrica", name: "Ortopedia Pediátrica", status: "ESPECIALIDADE", Icon: Bone },
  { id: "cirurgia-cardiaca", name: "Cirurgia Cardíaca", status: "ESPECIALIDADE", Icon: HeartPulse },
  { id: "medicina-esportiva", name: "Medicina Esportiva", status: "ESPECIALIDADE", Icon: Activity },
];

export default function Interesses() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [queuedInterests, setQueuedInterests] = useState([]);

  const toggleInterest = (interestId) => {
    setSelectedInterests((currentInterests) =>
      currentInterests.includes(interestId)
        ? currentInterests.filter((id) => id !== interestId)
        : [...currentInterests, interestId]
    );
  };

  const allInterests = [...featuredInterests, ...specialtyInterests];
  const selectedCount = selectedInterests.length;
  const selectedCards = allInterests.filter(({ id }) =>
    selectedInterests.includes(id)
  );
  // Show up to 8 unselected interests by default; when "Ver todas" is active show all
  const unselectedInterests = allInterests.filter(({ id }) => !selectedInterests.includes(id));
  const visibleTags = showAllSpecialties
    ? unselectedInterests
    : unselectedInterests.slice(0, 8);

  const handleEnterQueue = () => {
    setQueuedInterests(selectedInterests);
  };

  const handleLeaveQueue = () => {
    setQueuedInterests([]);
  };

  const displayedSelectedCards = selectedCards.filter(({ id }) => !queuedInterests.includes(id));

  const removeFromQueue = (interestId) => {
    setQueuedInterests((q) => q.filter((i) => i !== interestId));
  };

  return (
    <div className="interesses-page">
      <div className="interesses-card">
        <header className="interesses-header">
          <div className="interesses-brand">
            <AppLogo size="small" />
          </div>

          <button type="button" className="interesses-search-btn">
            <Search size={18} />
          </button>
        </header>

        <main className="interesses-content">
          <section className="interesses-title-group">
            <h1>Fila Inteligente</h1>

            <p>
              Selecione as especialidades de seu interesse. Avisaremos
              instantaneamente quando surgir uma vaga prioritaria para voce.
            </p>
          </section>

          {/* Fila fixa logo abaixo do título */}
          {queuedInterests.length > 0 && (
            <div className="fila-header">
              <span>Na fila de espera</span>
              <button type="button" className="fila-exit-btn" onClick={handleLeaveQueue}>Sair da fila</button>
            </div>
          )}

          <section className="fila-container">
            {queuedInterests.map((id) => {
              const item = allInterests.find((it) => it.id === id);
              if (!item) return null;
              const { name, Icon, status } = item;

              return (
                <div key={id} className="fila-card">
                  <div className="fila-left">
                    <div className="interesse-icon green">{createElement(Icon, { size: 16 })}</div>
                    <div className="fila-info">
                      <strong>{name}</strong>
                      <span className="fila-status">{status}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="fila-exit-single"
                    aria-label={`Sair da fila ${name}`}
                    onClick={() => removeFromQueue(id)}
                  >
                    Sair
                  </button>
                </div>
              );
            })}
          </section>

              <section className="interesses-grid">
                {displayedSelectedCards.map(({ id, name, status, Icon }) => {
                  return (
                    <div key={id} className="interesse-card active">
                      <div className="interesse-top-row">
                        <div className={`interesse-icon green`}>{createElement(Icon, { size: 18 })}</div>

                        <button
                          type="button"
                          className="interesse-remove-btn"
                          aria-label={`Remover ${name}`}
                          onClick={() => {
                            toggleInterest(id);
                            setQueuedInterests((q) => q.filter((i) => i !== id));
                          }}
                        >
                          <Minus size={16} />
                        </button>
                      </div>

                      <div className="interesse-content-box">
                        <h3>{name}</h3>
                        <span>{status}</span>
                      </div>
                    </div>
                  );
                })}

                {/* If no selected cards, show a placeholder message or small hint */}
                {displayedSelectedCards.length === 0 && (
                  <div className="interesse-empty">Selecione um interesse abaixo</div>
                )}
              </section>

          <button
            type="button"
            className={`interesses-toggle-btn ${
              showAllSpecialties ? "active" : ""
            }`}
            aria-expanded={showAllSpecialties}
            onClick={() => setShowAllSpecialties((isShowing) => !isShowing)}
          >
            <span>{showAllSpecialties ? "Ver menos" : "Ver todas"}</span>
            <Plus size={16} />
          </button>

          <section className="interesses-tags">
            {visibleTags.map(({ id, name, Icon }) => (
              <button
                key={id}
                type="button"
                className="tag-button"
                aria-pressed={false}
                onClick={() => toggleInterest(id)}
              >
                <div className="tag-icon">{Icon ? createElement(Icon, { size: 14 }) : null}</div>
                <span className="tag-name">{name}</span>
                <div className="tag-action">
                  <Plus size={14} />
                </div>
              </button>
            ))}
          </section>

          <button
            type="button"
            className="interesses-main-btn"
            disabled={selectedCount === 0}
            onClick={handleEnterQueue}
          >
            {selectedCount > 0
              ? `Entrar na Fila (${selectedCount})`
                : "Selecione interesses"}

            <Zap size={16} fill="white" />
          </button>
        </main>

        <AppNav className="interesses-bottom-nav" active="interesses" />
      </div>
    </div>
  );
}
