import {
  LuUserPlus,
  LuSlidersHorizontal,
  LuDownload,
  LuStethoscope,
  LuBrain,
  LuBaby,
  LuCamera,
} from 'react-icons/lu';
import './styles.css';

const professionals = [
  {
    id: 1,
    name: 'Dra. Beatriz Santos',
    email: 'beatriz.santos@unimed.com',
    specialty: 'Ginecologia',
    crm: 'CRM-RS 12345',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Dr. Ricardo Oliveira',
    email: 'ricardo.o@unimed.com',
    specialty: 'Ortopedia',
    crm: 'CRM-RS 54321',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Dra. Mariana Lima',
    email: 'm.lima@unimed.com',
    specialty: 'Clínica Médica',
    crm: 'CRM-RS 98765',
    status: 'Inativo',
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Dr. Felipe Arantes',
    email: 'f.arantes@unimed.com',
    specialty: 'Cardiologia',
    crm: 'CRM-RS 67899',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face',
  },
];

export default function Professionals() {
  return (
    <main className="professionals-page">
      <section className="professionals-header">
        <div>
          <h1>Gestão de Profissionais</h1>
          <p>
            Administre a base de médicos e equipe assistencial da sua unidade.
          </p>
        </div>

        <button type="button" className="professionals-header__button">
          <LuUserPlus size={18} />
          Cadastrar Profissional
        </button>
      </section>

      <section className="professionals-content">
        <aside className="professionals-sidebar">
          <div className="stats-card">
            <span className="stats-card__label">TOTAL DE ATIVOS</span>
            <strong>142</strong>
            <p>↗ +12 novos este mês</p>
          </div>

          <div className="specialties-card">
            <h2>Especialidades em Alta</h2>

            <div className="specialty-item">
              <div className="specialty-item__icon">
                <LuStethoscope size={16} />
              </div>
              <span>Cardiologia</span>
              <strong>24 Prof.</strong>
            </div>

            <div className="specialty-item">
              <div className="specialty-item__icon">
                <LuBrain size={16} />
              </div>
              <span>Neurologia</span>
              <strong>18 Prof.</strong>
            </div>

            <div className="specialty-item">
              <div className="specialty-item__icon">
                <LuBaby size={16} />
              </div>
              <span>Pediatria</span>
              <strong>31 Prof.</strong>
            </div>
          </div>
        </aside>

        <div className="professionals-table-card">
          <div className="professionals-table-card__header">
            <h2>Lista de Profissionais</h2>

            <div className="professionals-table-card__actions">
              <button type="button">
                <LuSlidersHorizontal size={17} />
              </button>

              <button type="button">
                <LuDownload size={17} />
              </button>
            </div>
          </div>

          <div className="professionals-table-wrapper">
            <table className="professionals-table">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>ESPECIALIDADE</th>
                  <th>CRM/CONSELHO</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>
                {professionals.map((professional) => (
                  <tr key={professional.id}>
                    <td>
                      <div className="professional-info">
                        <img
                          src={professional.avatar}
                          alt={professional.name}
                        />

                        <div>
                          <strong>{professional.name}</strong>
                          <span>{professional.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{professional.specialty}</td>

                    <td>
                      <span className="crm-badge">{professional.crm}</span>
                    </td>

                    <td>
                      <span
                        className={
                          professional.status === 'Ativo'
                            ? 'status-badge status-badge--active'
                            : 'status-badge status-badge--inactive'
                        }
                      >
                        {professional.status}
                      </span>
                    </td>

                    <td>
                      <div className="professional-actions">
                        <button
                          type="button"
                          className="professional-actions__edit"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            professional.status === 'Ativo'
                              ? 'professional-actions__disable'
                              : 'professional-actions__enable'
                          }
                        >
                          {professional.status === 'Ativo'
                            ? 'Desativar'
                            : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="professionals-table-card__footer">
            <span>Exibindo 4 de 142 profissionais</span>

            <div className="pagination">
              <button type="button">‹</button>
              <button type="button" className="pagination__active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">›</button>
            </div>
          </div>
        </div>
      </section>

      <section className="professional-form-card">
        <div className="professional-form-card__title">
          <div className="professional-form-card__icon">
            <LuUserPlus size={24} />
          </div>

          <div>
            <h2>Cadastro de Profissional</h2>
            <p>
              Insira os dados cadastrais e profissionais do novo integrante.
            </p>
          </div>
        </div>

        <form className="professional-form">
          <div className="professional-form__column">
            <h3>DADOS PESSOAIS</h3>

            <label>
              Nome Completo
              <input type="text" placeholder="Ex: Dr. João da Silva" />
            </label>

            <label>
              E-mail Institucional
              <input type="email" placeholder="nome@unimed.com" />
            </label>

            <label>
              Telefone / WhatsApp
              <input type="text" placeholder="(53) 00000-0000" />
            </label>
          </div>

          <div className="professional-form__column">
            <h3>ATUAÇÃO PROFISSIONAL</h3>

            <label>
              Especialidade Principal
              <select defaultValue="">
                <option value="" disabled>
                  Selecione uma especialidade
                </option>
                <option value="cardiologia">Cardiologia</option>
                <option value="neurologia">Neurologia</option>
                <option value="pediatria">Pediatria</option>
                <option value="ginecologia">Ginecologia</option>
              </select>
            </label>

            <div className="professional-form__row">
              <label>
                Nº Registro (CRM)
                <input type="text" placeholder="00000" />
              </label>

              <label>
                UF
                <select defaultValue="RS">
                  <option value="RS">RS</option>
                  <option value="SC">SC</option>
                  <option value="PR">PR</option>
                </select>
              </label>
            </div>

            <label>
              Carga Horária Semanal
              <input type="number" placeholder="40" />
            </label>
          </div>

          <div className="professional-form__column">
            <h3>PERFIL E DOCUMENTOS</h3>

            <div className="upload-card">
              <div className="upload-card__icon">
                <LuCamera size={24} />
              </div>

              <div>
                <strong>Foto de Perfil</strong>
                <span>PNG ou JPG até 2MB.</span>
                <span>Utilizada na agenda.</span>
              </div>
            </div>

            <div className="status-field">
              <span>Status Inicial</span>

              <div className="status-field__options">
                <label>
                  <input type="radio" name="status" defaultChecked />
                  Ativo
                </label>

                <label>
                  <input type="radio" name="status" />
                  Inativo
                </label>
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="form-buttons__cancel">
                Cancelar
              </button>

              <button type="submit" className="form-buttons__save">
                Salvar Cadastro
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
