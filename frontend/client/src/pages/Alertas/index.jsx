import "../Vagas/styles.css";

import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  Search,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  aceitarVaga,
  getVagasTempoReal,
  recusarVaga,
} from "../../api/alarmesApi";

export default function Alertas() {
  const [vagas, setVagas] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    processingMatchId,
    setProcessingMatchId,
  ] = useState(null);

  /*
   * Esta mensagem precisa aparecer no Console.
   */
  console.log(
    "COMPONENTE NOVO DE ALERTAS CARREGADO",
  );

  const loadVagas = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const data =
          await getVagasTempoReal();

        console.log(
          "Alertas recebeu do alarmesApi:",
          data,
        );

        const list =
          Array.isArray(data)
            ? data.filter(Boolean)
            : [];

        console.log(
          "Executando setVagas com:",
          list,
        );

        setVagas(list);
      } catch (error) {
        console.error(
          "Erro ao carregar alertas:",
          error,
        );

        setVagas([]);

        toast.error(
          error?.message ||
            "Não foi possível carregar as vagas.",
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadVagas();

    const intervalId =
      window.setInterval(() => {
        void loadVagas({
          showLoading: false,
        });
      }, 15000);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [loadVagas]);

  const handleAccept = async (
    vaga,
  ) => {
    try {
      setProcessingMatchId(
        vaga.matchId,
      );

      await aceitarVaga(
        vaga.matchId,
      );

      toast.success(
        "Vaga aceita com sucesso!",
      );

      setVagas(
        (currentVagas) =>
          currentVagas.filter(
            (currentVaga) =>
              currentVaga.matchId !==
              vaga.matchId,
          ),
      );
    } catch (error) {
      console.error(
        "Erro ao aceitar vaga:",
        error,
      );

      toast.error(
        error?.message ||
          "Não foi possível aceitar a vaga.",
      );
    } finally {
      setProcessingMatchId(null);
    }
  };

  const handleReject = async (
    vaga,
  ) => {
    try {
      setProcessingMatchId(
        vaga.matchId,
      );

      await recusarVaga(
        vaga.matchId,
      );

      toast.success(
        "Vaga recusada.",
      );

      setVagas(
        (currentVagas) =>
          currentVagas.filter(
            (currentVaga) =>
              currentVaga.matchId !==
              vaga.matchId,
          ),
      );
    } catch (error) {
      console.error(
        "Erro ao recusar vaga:",
        error,
      );

      toast.error(
        error?.message ||
          "Não foi possível recusar a vaga.",
      );
    } finally {
      setProcessingMatchId(null);
    }
  };

  return (
    <div className="vagas-page">
      <div className="vagas-card">
        <header className="vagas-header">
          <div className="vagas-brand">
            <AppLogo size="small" />
          </div>

          <button
            type="button"
            className="vagas-search-btn"
            aria-label="Atualizar vagas"
            onClick={() => {
              void loadVagas();
            }}
          >
            <Search size={20} />
          </button>
        </header>

        <main className="vagas-content">
          <section className="vagas-title-group">
            <div className="vagas-title-line" />

            <div>
              <h1>
                Vagas em Tempo Real
              </h1>

              <p>
                As oportunidades expiram
                rapidamente. Aceite agora
                para garantir o horário.
              </p>
            </div>
          </section>

          <section className="vagas-list">
            {isLoading && (
              <p>
                Carregando vagas...
              </p>
            )}

            {!isLoading &&
              vagas.length === 0 && (
                <p>
                  Nenhuma vaga disponível
                  no momento.
                </p>
              )}

            {!isLoading &&
              vagas.map((vaga) => {
                const isProcessing =
                  processingMatchId ===
                  vaga.matchId;

                return (
                  <article
                    key={vaga.matchId}
                    className={`vaga-item ${vaga.variant}`}
                  >
                    <div className="vaga-top">
                      <div className="vaga-profile">
                        <div className="vaga-profile-image" />

                        <div>
                          <h3>
                            {vaga.medico}
                          </h3>

                          <span>
                            {vaga.especialidade}
                          </span>
                        </div>
                      </div>

                      {vaga.urgente && (
                        <div className="vaga-tag">
                          URGENTE
                        </div>
                      )}
                    </div>

                    <div className="vaga-bottom">
                      <div className="vaga-time">
                        <small>
                          HORÁRIO DISPONÍVEL
                        </small>

                        <div className="vaga-time-row">
                          <Clock3 size={18} />

                          <strong>
                            {vaga.horario}
                          </strong>
                        </div>

                        <small>
                          {vaga.dataFormatada}
                        </small>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <button
                          type="button"
                          className="vaga-button"
                          disabled={isProcessing}
                          onClick={() => {
                            void handleReject(
                              vaga,
                            );
                          }}
                        >
                          Recusar
                        </button>

                        <button
                          type="button"
                          className="vaga-button"
                          disabled={isProcessing}
                          onClick={() => {
                            void handleAccept(
                              vaga,
                            );
                          }}
                        >
                          {isProcessing
                            ? "Processando..."
                            : "Aceite Rápido"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </section>
        </main>

        <AppNav
          className="vagas-bottom-nav"
          active="alertas"
        />
      </div>
    </div>
  );
}