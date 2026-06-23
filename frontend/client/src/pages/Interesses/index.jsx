import "./styles.css";
import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";
import { useState } from "react";

import {
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
  Plus,
  Zap,
  CircleCheck,
  CirclePlus,
  Eye,
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

const tagInterests = [
  "Gastroenterologia",
  "Dermatologia",
  "Neurologia",
  "Oftalmologia",
];

export default function Interesses() {
  const [selectedInterests, setSelectedInterests] = useState(["ortopedia"]);

  const toggleInterest = (interestId) => {
    setSelectedInterests((currentInterests) =>
      currentInterests.includes(interestId)
        ? currentInterests.filter((id) => id !== interestId)
        : [...currentInterests, interestId]
    );
  };

  const selectedCount = selectedInterests.length;

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

          <section className="interesses-grid">
            {featuredInterests.map(({ id, name, status, Icon }) => {
              const isSelected = selectedInterests.includes(id);

              return (
                <button
                  key={id}
                  type="button"
                  className={`interesse-card ${isSelected ? "active" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => toggleInterest(id)}
                >
                  <div className="interesse-top-row">
                    <div
                      className={`interesse-icon ${
                        isSelected ? "green" : "light"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {isSelected ? (
                      <CircleCheck size={18} />
                    ) : (
                      <CirclePlus className="interesse-add-icon" size={18} />
                    )}
                  </div>

                  <div className="interesse-content-box">
                    <h3>{name}</h3>

                    <span>{status}</span>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              className="interesse-card view-all"
            >
              <div className="view-all-icons">
                <Eye size={14} />
                <Eye size={14} />
                <Plus size={14} />
              </div>

              <div className="interesse-content-box">
                <h3>Ver Todas</h3>
              </div>
            </button>
          </section>

          <section className="interesses-tags">
            {tagInterests.map((interest) => {
              const interestId = interest.toLowerCase();
              const isSelected = selectedInterests.includes(interestId);

              return (
                <button
                  key={interestId}
                  type="button"
                  className={isSelected ? "active" : ""}
                  aria-pressed={isSelected}
                  onClick={() => toggleInterest(interestId)}
                >
                  {interest} {isSelected ? "✓" : "+"}
                </button>
              );
            })}
          </section>

          <button
            type="button"
            className="interesses-main-btn"
            disabled={selectedCount === 0}
          >
            {selectedCount > 0
              ? `Entrar na Fila (${selectedCount})`
              : "Escolha um Interesse"}

            <Zap size={16} fill="white" />
          </button>
        </main>

        <AppNav className="interesses-bottom-nav" active="interesses" />
      </div>
    </div>
  );
}
