import {
  LuSlidersHorizontal,
  LuDownload,
  LuCircleAlert,
  LuChartBar,
  LuMessagesSquare,
  LuPlus,
  LuCircleCheck,
} from 'react-icons/lu';
import './styles.css';

const patients = [
  {
    id: 1,
    name: 'Beatriz Helena Ferreira',
    cpf: '123.***.***-01',
    lastVisitDate: '12 Mai, 2024',
    lastVisitType: 'Clínica Geral',
    status: 'Ativo',
    nextScheduleDate: '18 Jun, 2024',
    nextScheduleType: 'Dermatologia',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Ricardo Mendes Albuquerque',
    cpf: '892.***.***-45',
    lastVisitDate: '05 Jun, 2024',
    lastVisitType: 'Cardiologia',
    status: 'Em fila',
    nextScheduleDate: 'Sem agendamento',
    nextScheduleType: '',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Joaquim de Souza Neto',
    cpf: '541.***.***-22',
    lastVisitDate: '10 Jan, 2024',
    lastVisitType: 'Ortopedia',
    status: 'Inativo',
    nextScheduleDate: 'Sem agendamento',
    nextScheduleType: '',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Mariana Luzia Santos',
    cpf: '211.***.***-98',
    lastVisitDate: '01 Jun, 2024',
    lastVisitType: 'Nutrologia',
    status: 'Ativo',
    nextScheduleDate: '25 Jun, 2024',
    nextScheduleType: 'Retorno Exames',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
  },
];

export default function Patients() {
  return (
    <main className="patients-page">
      <section className="patients-header">
        <div>
          <h1>Gestão de Pacientes</h1>
          <p>Visualize a lista completa e histórico de usuários confirmados no sistema.</p>
        </div>

        <div className="patients-header__actions">
          <button type="button">
            <LuSlidersHorizontal size={14} />
            Filtros Avançados
          </button>

          <button type="button">
            <LuDownload size={14} />
            Exportar Relatório
          </button>
        </div>
      </section>

      <section className="patients-stats">
        <div className="patient-stat-card">
          <span>TOTAL ATIVOS</span>
          <strong>1.284</strong>
          <p>↗ +12% este mês</p>
        </div>

        <div className="patient-stat-card">
          <span>EM FILA DE ESPERA</span>
          <strong>42</strong>
          <p>
            <LuCircleAlert size={12} />
            Tempo médio: 14 min
          </p>
        </div>

        <div className="patient-stat-card">
          <span>ATENDIMENTOS HOJE</span>
          <strong>156</strong>
          <p className='patient-stat-card-check'>
            <LuCircleCheck />
            94% concluídos
          </p>
        </div>

        <div className="patient-stat-card patient-stat-card--highlight">
          <span>NOVOS ESTE MÊS</span>
          <strong>89</strong>
          <p>Crescimento constante</p>
        </div>
      </section>

      <section className="patients-table-card">
        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>NOME DO PACIENTE</th>
                <th>ÚLTIMO ATENDIMENTO</th>
                <th>STATUS</th>
                <th>PRÓXIMO AGENDAMENTO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-info">
                      <img src={patient.avatar} alt={patient.name} />

                      <div>
                        <strong>{patient.name}</strong>
                        <span>CPF: {patient.cpf}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong className="table-main-text">{patient.lastVisitDate}</strong>
                    <span className="table-secondary-text">{patient.lastVisitType}</span>
                  </td>

                  <td>
                    <span
                      className={`patient-status patient-status--${patient.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      {patient.status}
                    </span>
                  </td>

                  <td>
                    <strong
                      className={
                        patient.nextScheduleDate === 'Sem agendamento'
                          ? 'table-main-text'
                          : 'table-main-text table-main-text--green'
                      }
                    >
                      {patient.nextScheduleDate}
                    </strong>

                    {patient.nextScheduleType && (
                      <span className="table-secondary-text">
                        {patient.nextScheduleType}
                      </span>
                    )}
                  </td>

                  <td>
                    <button type="button" className="patient-history-button">
                      Histórico
                      <br />
                      Completo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="patients-table-card__footer">
          <span>Exibindo 4 de 1.284 pacientes</span>

          <div className="patients-pagination">
            <button type="button">‹</button>
            <button type="button" className="patients-pagination__active">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">›</button>
          </div>
        </div>
      </section>

      <section className="patients-bottom-grid">
        <div className="retention-card">
          <div className="retention-card__icon">
            <LuChartBar size={34} />
          </div>

          <div>
            <h2>Análise de Retenção</h2>

            <p>
              Nosso sistema de IA identificou um aumento de 15% na taxa de retorno
              para consultas preventivas. Continue utilizando as notificações automáticas
              para manter seus pacientes engajados.
            </p>

            <button type="button">Ver Dashboard de Performance →</button>
          </div>
        </div>

        <div className="clinical-support-card">
          <LuMessagesSquare size={28} />

          <h2>Suporte Clínico</h2>

          <p>
            Precisa de ajuda com a integração de prontuários antigos? Nossa equipe está
            pronta.
          </p>

          <button type="button">Falar com Consultor</button>
        </div>
      </section>

      <button type="button" className="patients-floating-button">
        <LuPlus size={26} />
      </button>
    </main>
  );
}