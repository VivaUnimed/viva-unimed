import "./styles.css";

import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";

import {
  createElement,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
  Plus,
  Minus,
  Bone,
  Brain,
  Eye as EyeIcon,
  Smile,
  Activity,
  Syringe,
  Ear,
  ScanHeart,
} from "lucide-react";

import {
  addInteresse,
  getInteresses,
  removeInteresse,
} from "../../api/interessesApi";

const iconMap = {
  Stethoscope,
  HeartPulse,
  Baby,
  Bone,
  Brain,
  EyeIcon,
  Smile,
  Activity,
  Syringe,
  Ear,
  ScanHeart,
};

const getIconComponent = (iconName) =>
  iconMap[iconName] || Stethoscope;

const normalizeInterestId = (value) =>
  String(value);

export default function Interesses() {
  const [interesses, setInteresses] =
    useState([]);

  const [
    showAllSpecialties,
    setShowAllSpecialties,
  ] = useState(false);

  const [
    isLoadingInteresses,
    setIsLoadingInteresses,
  ] = useState(false);

  const [
    isSavingQueue,
    setIsSavingQueue,
  ] = useState(false);

  /**
   * Carrega as especialidades e as filas
   * atualmente cadastradas no backend.
   */
  const loadInteresses = async () => {
    try {
      setIsLoadingInteresses(true);

      const data = await getInteresses();

      setInteresses(data);
    } catch (error) {
      toast.error(
        error.message ||
          "Não foi possível carregar seus interesses no momento.",
      );
    } finally {
      setIsLoadingInteresses(false);
    }
  };

  useEffect(() => {
    void loadInteresses();
  }, []);

  /**
   * Interesses que já estão gravados no backend.
   */
  const queuedInterests =
    interesses.filter(
      ({ queued }) => queued,
    );

  /**
   * Interesses selecionados pelo usuário,
   * mas ainda não enviados ao backend.
   */
  const selectedInterests =
    interesses.filter(
      ({ selected, queued }) =>
        selected && !queued,
    );

  const selectedCount =
    selectedInterests.length;

  /**
   * Especialidades que ainda não foram
   * selecionadas nem adicionadas à fila.
   */
  const unselectedInterests =
    interesses.filter(
      ({ selected, queued }) =>
        !selected && !queued,
    );

  const visibleTags =
    showAllSpecialties
      ? unselectedInterests
      : unselectedInterests.slice(0, 8);

  /**
   * Apenas marca ou desmarca visualmente.
   *
   * O POST só será executado ao clicar
   * no botão "Entrar na Fila".
   */
  const handleToggleInterest = (
    interestId,
  ) => {
    const normalizedId =
      normalizeInterestId(interestId);

    setInteresses(
      (currentInteresses) =>
        currentInteresses.map(
          (interest) => {
            if (
              normalizeInterestId(
                interest.id,
              ) !== normalizedId
            ) {
              return interest;
            }

            /*
             * Se já está na fila, deve usar
             * o botão "Sair".
             */
            if (interest.queued) {
              return interest;
            }

            return {
              ...interest,
              selected:
                !interest.selected,
            };
          },
        ),
    );
  };

  /**
   * Envia todos os interesses selecionados
   * para appointment-request.
   */
  const handleEnterQueue = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    try {
      setIsSavingQueue(true);

      await Promise.all(
        selectedInterests.map(
          ({ id }) =>
            addInteresse(id),
        ),
      );

      toast.success(
        selectedInterests.length === 1
          ? "Você entrou na fila de espera."
          : "Você entrou nas filas selecionadas.",
      );

      /*
       * Recarrega os dados reais do backend.
       */
      await loadInteresses();
    } catch (error) {
      toast.error(
        error.message ||
          "Não foi possível entrar na fila.",
      );
    } finally {
      setIsSavingQueue(false);
    }
  };

  /**
   * Remove todas as solicitações waiting
   * do paciente.
   */
  const handleLeaveQueue = async () => {
    const requests =
      queuedInterests.filter(
        ({ requestId }) => requestId,
      );

    if (requests.length === 0) {
      return;
    }

    try {
      setIsSavingQueue(true);

      await Promise.all(
        requests.map(
          ({ requestId }) =>
            removeInteresse(requestId),
        ),
      );

      toast.success(
        "Você saiu da fila de espera.",
      );

      await loadInteresses();
    } catch (error) {
      toast.error(
        error.message ||
          "Não foi possível sair da fila.",
      );
    } finally {
      setIsSavingQueue(false);
    }
  };

  /**
   * Remove somente uma especialidade da fila.
   */
  const removeFromQueue = async (
    interest,
  ) => {
    if (!interest?.requestId) {
      toast.error(
        "Solicitação da fila não encontrada.",
      );

      return;
    }

    try {
      setIsSavingQueue(true);

      await removeInteresse(
        interest.requestId,
      );

      toast.success(
        `Você saiu da fila de ${interest.name}.`,
      );

      await loadInteresses();
    } catch (error) {
      toast.error(
        error.message ||
          "Não foi possível sair da fila.",
      );
    } finally {
      setIsSavingQueue(false);
    }
  };

  return (
    <div className="interesses-page">
      <div className="interesses-card">
        <header className="interesses-header">
          <div className="interesses-brand">
            <AppLogo size="small" />
          </div>

          <button
            type="button"
            className="interesses-search-btn"
            aria-label="Pesquisar especialidades"
          >
            <Search size={18} />
          </button>
        </header>

        <main className="interesses-content">
          <section className="interesses-title-group">
            <h1>Fila Inteligente</h1>

            <p>
              Selecione as especialidades de
              seu interesse. Avisaremos
              instantaneamente quando surgir
              uma vaga prioritária para você.
            </p>
          </section>

          {queuedInterests.length > 0 && (
            <div className="fila-header">
              <span>
                Na fila de espera
              </span>

              <button
                type="button"
                className="fila-exit-btn"
                disabled={isSavingQueue}
                onClick={() => {
                  void handleLeaveQueue();
                }}
              >
                Sair da fila
              </button>
            </div>
          )}

          <section className="fila-container">
            {queuedInterests.map(
              (item) => {
                const {
                  id,
                  name,
                  status,
                  iconName,
                } = item;

                const IconComponent =
                  getIconComponent(
                    iconName,
                  );

                return (
                  <div
                    key={id}
                    className="fila-card"
                  >
                    <div className="fila-left">
                      <div className="interesse-icon green">
                        {createElement(
                          IconComponent,
                          {
                            size: 16,
                          },
                        )}
                      </div>

                      <div className="fila-info">
                        <strong>
                          {name}
                        </strong>

                        <span className="fila-status">
                          {status}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="fila-exit-single"
                      disabled={
                        isSavingQueue
                      }
                      aria-label={`Sair da fila ${name}`}
                      onClick={() => {
                        void removeFromQueue(
                          item,
                        );
                      }}
                    >
                      Sair
                    </button>
                  </div>
                );
              },
            )}
          </section>

          <section className="interesses-grid">
            {selectedInterests.map(
              ({
                id,
                name,
                status,
                iconName,
              }) => {
                const IconComponent =
                  getIconComponent(
                    iconName,
                  );

                return (
                  <div
                    key={id}
                    className="interesse-card active"
                  >
                    <div className="interesse-top-row">
                      <div className="interesse-icon green">
                        {createElement(
                          IconComponent,
                          {
                            size: 18,
                          },
                        )}
                      </div>

                      <button
                        type="button"
                        className="interesse-remove-btn"
                        aria-label={`Remover ${name}`}
                        onClick={() =>
                          handleToggleInterest(
                            id,
                          )
                        }
                      >
                        <Minus size={16} />
                      </button>
                    </div>

                    <div className="interesse-content-box">
                      <h3>{name}</h3>
                      <span>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              },
            )}

            {selectedInterests.length ===
              0 &&
              !isLoadingInteresses && (
                <div className="interesse-empty">
                  Selecione um interesse
                  abaixo
                </div>
              )}

            {isLoadingInteresses && (
              <div className="interesse-empty">
                Carregando
                especialidades...
              </div>
            )}
          </section>

          <section className="interesses-tags">
            {visibleTags.map(
              ({
                id,
                name,
                iconName,
                selected,
              }) => {
                const IconComponent =
                  getIconComponent(
                    iconName,
                  );

                return (
                  <button
                    key={id}
                    type="button"
                    className="tag-button"
                    aria-pressed={
                      selected
                    }
                    onClick={() =>
                      handleToggleInterest(
                        id,
                      )
                    }
                  >
                    <div className="tag-icon">
                      {createElement(
                        IconComponent,
                        {
                          size: 14,
                        },
                      )}
                    </div>

                    <span className="tag-name">
                      {name}
                    </span>

                    <div className="tag-action">
                      <Plus size={14} />
                    </div>
                  </button>
                );
              },
            )}
          </section>

          <button
            type="button"
            className={`interesses-toggle-btn ${
              showAllSpecialties
                ? "active"
                : ""
            }`}
            aria-expanded={
              showAllSpecialties
            }
            onClick={() =>
              setShowAllSpecialties(
                (isShowing) =>
                  !isShowing,
              )
            }
          >
            <span>
              {showAllSpecialties
                ? "Ver menos"
                : "Ver todas"}
            </span>

            <Plus size={16} />
          </button>

          <button
            type="button"
            className="interesses-main-btn"
            disabled={
              selectedCount === 0 ||
              isSavingQueue
            }
            onClick={() => {
              void handleEnterQueue();
            }}
          >
            {isSavingQueue
              ? "Salvando..."
              : selectedCount > 0
                ? `Entrar na Fila (${selectedCount})`
                : "Selecione interesses"}
          </button>
        </main>

        <AppNav
          className="interesses-bottom-nav"
          active="interesses"
        />
      </div>
    </div>
  );
}