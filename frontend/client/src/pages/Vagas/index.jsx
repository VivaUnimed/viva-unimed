import './styles.css';

import AppNav from '../../components/layouts/AppNav';
import AppLogo from '../../components/layouts/AppLogo';

import {
  Search,
  Clock3,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  aceitarVaga,
  getVagasTempoReal,
  recusarVaga,
} from '../../api/alarmesApi';

export default function VagasDisponiveis() {
  const [vagas, setVagas] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /**
   * Guarda o ID da vaga que está sendo
   * aceita ou recusada.
   *
   * Evita que o usuário clique duas vezes.
   */
  const [
    processingMatchId,
    setProcessingMatchId,
  ] = useState(null);

  /**
   * Carrega as vagas do paciente autenticado.
   */
  const loadVagas = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        setError('');

        const data =
          await getVagasTempoReal();

        setVagas(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          'Erro ao carregar vagas:',
          err,
        );

        setError(
          err?.message ||
            'Não foi possível carregar as vagas.',
        );

        setVagas([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  /**
   * Carrega quando entra na página.
   */
  useEffect(() => {
    loadVagas();

    /**
     * Atualiza automaticamente a cada
     * 15 segundos.
     *
     * Assim, novas vagas podem aparecer
     * sem o paciente atualizar a página.
     */
    const intervalId =
      window.setInterval(() => {
        loadVagas({
          showLoading: false,
        });
      }, 15000);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [loadVagas]);

  /**
   * Aceitar uma oferta.
   */
  const handleAceitar = async (
    vaga,
  ) => {
    const matchId =
      vaga.matchId ??
      vaga.id;

    if (!matchId) {
      window.alert(
        'Não foi possível identificar esta oferta.',
      );

      return;
    }

    try {
      setProcessingMatchId(matchId);

      await aceitarVaga(matchId);

      /**
       * Após aceitar, removemos imediatamente
       * a vaga da tela.
       */
      setVagas((current) =>
        current.filter(
          (item) =>
            (
              item.matchId ??
              item.id
            ) !== matchId,
        ),
      );

      window.alert(
        'Vaga aceita com sucesso!',
      );
    } catch (err) {
      console.error(
        'Erro ao aceitar vaga:',
        err,
      );

      window.alert(
        err?.message ||
          'Não foi possível aceitar a vaga.',
      );
    } finally {
      setProcessingMatchId(null);
    }
  };

  /**
   * Recusar uma oferta.
   */
  const handleRecusar = async (
    vaga,
  ) => {
    const matchId =
      vaga.matchId ??
      vaga.id;

    if (!matchId) {
      window.alert(
        'Não foi possível identificar esta oferta.',
      );

      return;
    }

    const confirmou =
      window.confirm(
        'Deseja realmente recusar esta vaga?',
      );

    if (!confirmou) {
      return;
    }

    try {
      setProcessingMatchId(matchId);

      await recusarVaga(matchId);

      /**
       * Após recusar, a oferta deixa
       * imediatamente a tela.
       */
      setVagas((current) =>
        current.filter(
          (item) =>
            (
              item.matchId ??
              item.id
            ) !== matchId,
        ),
      );

      window.alert(
        'Vaga recusada.',
      );
    } catch (err) {
      console.error(
        'Erro ao recusar vaga:',
        err,
      );

      window.alert(
        err?.message ||
          'Não foi possível recusar a vaga.',
      );
    } finally {
      setProcessingMatchId(null);
    }
  };

  return (
    <div className="vagas-page">
      <div className="vagas-card">

        {/* HEADER */}
        <header className="vagas-header">

          <div className="vagas-brand">
            <AppLogo size="small" />
          </div>

          <button
            type="button"
            className="vagas-search-btn"
            aria-label="Buscar vagas"
            onClick={() =>
              loadVagas()
            }
          >
            <Search size={20} />
          </button>

        </header>

        {/* CONTENT */}
        <main className="vagas-content">

          {/* TITLE */}
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

          {/* LIST */}
          <section className="vagas-list">

            {isLoading ? (
              <p>
                Carregando vagas...
              </p>
            ) : error ? (
              <div>
                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="vaga-button"
                  onClick={() =>
                    loadVagas()
                  }
                >
                  Tentar novamente
                </button>
              </div>
            ) : vagas.length === 0 ? (
              <p>
                Nenhuma vaga disponível
                no momento.
              </p>
            ) : (
              vagas.map((vaga) => {
                const matchId =
                  vaga.matchId ??
                  vaga.id;

                const isProcessing =
                  processingMatchId ===
                  matchId;

                return (
                  <div
                    className="vaga-item success"
                    key={matchId}
                  >

                    {/* PARTE SUPERIOR */}
                    <div className="vaga-top">

                      <div className="vaga-profile">

                        <div className="vaga-profile-image" />

                        <div>

                          <h3>
                            {vaga.medico ||
                              'Profissional'}
                          </h3>

                          <span>
                            {vaga.especialidade ||
                              'ESPECIALIDADE'}
                          </span>

                          {vaga.crm && (
                            <div
                              style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                color: '#6b7280',
                              }}
                            >
                              CRM {vaga.crm}
                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* PARTE INFERIOR */}
                    <div className="vaga-bottom">

                      <div className="vaga-time">

                        <small>
                          HORÁRIO DISPONÍVEL
                        </small>

                        <div className="vaga-time-row">

                          <Clock3 size={18} />

                          <strong>
                            {vaga.horario ||
                              '--:--'}
                          </strong>

                        </div>

                        {vaga.data && (
                          <div
                            style={{
                              marginTop: '5px',
                              fontSize: '12px',
                              color: '#6b7280',
                            }}
                          >
                            {vaga.data}
                          </div>
                        )}

                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >

                        {/* RECUSAR */}
                        <button
                          type="button"
                          className="vaga-button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleRecusar(
                              vaga,
                            )
                          }
                        >
                          {isProcessing
                            ? 'Aguarde...'
                            : 'Recusar'}
                        </button>

                        {/* ACEITAR */}
                        <button
                          type="button"
                          className="vaga-button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleAceitar(
                              vaga,
                            )
                          }
                        >
                          {isProcessing
                            ? 'Aguarde...'
                            : 'Aceite Rápido'}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </section>

        </main>

        {/* BOTTOM NAV */}
        <AppNav
          className="vagas-bottom-nav"
          active="alertas"
        />

      </div>
    </div>
  );
}