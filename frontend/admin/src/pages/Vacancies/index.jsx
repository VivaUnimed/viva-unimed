import {
  LuTriangleAlert,
  LuCalendarCheck,
  LuSearch,
  LuScanLine,
  LuHistory,
  LuZap,
  LuRefreshCw,
  LuPlus,
  LuMoveRight,
} from 'react-icons/lu';
import './styles.css';

const generatedSlots = [
  {
    id: 1,
    time: '14:30',
    date: 'Hoje, 24 Out',
    specialty: 'Cardiologia',
    professional: 'Dr. Ricardo Almeida',
    status: 'success',
    statusText: 'Sucesso (12 enviados)',
    action: 'Gerenciar',
  },
  {
    id: 2,
    time: '15:15',
    date: 'Hoje, 24 Out',
    specialty: 'Ortopedia',
    professional: 'Dra. Heloísa Santos',
    status: 'sending',
    statusText: 'Enviando...',
    action: 'Aguarde',
  },
  {
    id: 3,
    time: '16:45',
    date: 'Hoje, 24 Out',
    specialty: 'Pediatria',
    professional: 'Dr. Fábio Mello',
    status: 'waiting',
    statusText: 'Aguardando Disparo',
    action: 'Disparar Notificações',
  },
  {
    id: 4,
    time: '09:00',
    date: 'Amanhã, 25 Out',
    specialty: 'Dermatologia',
    professional: 'Dra. Cláudia Lima',
    status: 'error',
    statusText: 'Erro no Disparo (Fila Vazia)',
    action: 'retry',
  },
];

const waitingPatients = [
  {
    id: 1,
    specialty: 'Cardiologia',
    total: '18',
  },
  {
    id: 2,
    specialty: 'Ortopedia',
    total: '24',
  },
  {
    id: 3,
    specialty: 'Ginecologia',
    total: '07',
  },
];

export default function Vacancies() {
  return (
    <main className="idle-slots-page">
      <section className="idle-slots-header">
        <div>
          <h1>Vagas Ociosas</h1>
          <p>Gestão inteligente de desistências e otimização de agenda.</p>
        </div>

        <div className="system-status">
          <span>STATUS DO SISTEMA</span>
          <strong>
            <span className="system-status__dot" />
            Monitoramento Ativo
          </strong>
        </div>
      </section>

      <section className="idle-slots-main-grid">
        <aside className="idle-slots-left">
          <div className="instant-register-card">
            <div className="instant-register-card__circle" />

            <div className="instant-register-card__icon">
              <LuTriangleAlert size={32} />
            </div>

            <h2>
              Registro
              <br />
              Instantâneo
            </h2>

            <p>
              Localize o paciente e confirme a desistência para liberar a vaga
              imediatamente para a fila de espera.
            </p>

            <div className="instant-register-card__actions">
              <button type="button">
                <LuSearch size={19} />
                Buscar por CPF ou Nome
              </button>

              <button type="button">
                <LuScanLine size={19} />
                Escanear Guia Médica
              </button>
            </div>
          </div>

          <div className="queue-efficiency-card">
            <span>EFICIÊNCIA DE FILA</span>

            <div className="queue-efficiency-card__value">
              <strong>84%</strong>
              <small>↗ +12%</small>
            </div>

            <p>Taxa de preenchimento de vagas ociosas nesta semana.</p>

            <div className="queue-efficiency-card__progress">
              <div />
            </div>
          </div>

          <div className="waiting-patients-card">
            <h3>PACIENTES EM ESPERA</h3>

            {waitingPatients.map((item) => (
              <div key={item.id} className="waiting-patients-card__item">
                <span>{item.specialty}</span>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </aside>

        <section className="idle-slots-right">
          <div className="generated-slots-card">
            <div className="generated-slots-card__header">
              <div>
                <LuCalendarCheck size={22} />
                <h2>Vagas Geradas por Desistência</h2>
              </div>

              <button type="button">
                Ver Histórico Completo
                <LuMoveRight size={15} />
              </button>
            </div>

            <div className="generated-slots-table-wrapper">
              <table className="generated-slots-table">
                <thead>
                  <tr>
                    <th>HORÁRIO ORIGINAL</th>
                    <th>ESPECIALIDADE / PROFISSIONAL</th>
                    <th>STATUS DISPARO</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>

                <tbody>
                  {generatedSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td>
                        <strong>{slot.time}</strong>
                        <span>{slot.date}</span>
                      </td>

                      <td>
                        <strong>{slot.specialty}</strong>
                        <span>{slot.professional}</span>
                      </td>

                      <td>
                        <span
                          className={`slot-status slot-status--${slot.status}`}
                        >
                          {slot.statusText}
                        </span>
                      </td>

                      <td>
                        {slot.action === 'retry' ? (
                          <button
                            type="button"
                            className="slot-action slot-action--retry"
                          >
                            <LuRefreshCw size={22} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`slot-action ${
                              slot.status === 'waiting'
                                ? 'slot-action--primary'
                                : ''
                            } ${
                              slot.status === 'sending'
                                ? 'slot-action--disabled'
                                : ''
                            }`}
                            disabled={slot.status === 'sending'}
                          >
                            {slot.action}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="automation-card">
            <div className="automation-card__left">
              <div className="automation-card__icon">
                <LuHistory size={42} />
              </div>

              <div>
                <h2>
                  Automação de
                  <br />
                  Fila de Espera
                </h2>

                <p>
                  O sistema identifica automaticamente os próximos pacientes na
                  fila de espera prioritária e dispara notificações via WhatsApp
                  e SMS assim que uma vaga é liberada.
                </p>
              </div>
            </div>

            <div className="automation-card__right">
              <button type="button">
                <LuZap size={20} />
                Disparar Notificações para Fila
              </button>

              <span>ÚLTIMO DISPARO GLOBAL: HÁ 14 MIN</span>
            </div>
          </div>
        </section>
      </section>

      <button type="button" className="floating-action-button">
        <LuPlus size={28} />
      </button>
    </main>
  );
}