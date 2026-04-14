import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import PasswordField from '../../components/ui/PasswordField';
import './styles.css';
import { FaLock, FaPlusSquare } from 'react-icons/fa';

export default function Signup() {
  return (
    <div className="signup-paciente-page">
      <div className="signup-paciente-card">
        <div className="signup-paciente-header">
          <div className="signup-paciente-logo-icon">
            <FaPlusSquare />
          </div>

          <div className="signup-paciente-brand">
            <h2>UNIMED</h2>
            <span>LITORAL SUL</span>
          </div>
        </div>

        <div className="signup-paciente-content">
          <form className="signup-paciente-form">
            <div className="signup-paciente-title-group">
              <h1>
                Criar Conta
                <br />
                {/* <span>VivaUnimed</span> */}
              </h1>
              <p>
                Complete os dados para garantir um atendimento personalizado e
                seguro através da rede Unimed.
              </p>
            </div>

            <InputField
              id="name"
              name="name"
              label="NOME COMPLETO"
              type="text"
              placeholder="Ex: Maria Silva Oliveira"
            />

            <InputField
              id="email"
              name="email"
              label="E-MAIL DE CONTATO"
              type="text"
              placeholder="maria.silva@exemplo.com"
            />

            <InputField
              id="date_of_birth"
              name="date_of_birth"
              label="DATA DE NASCIMENTO"
              type="date"
              placeholder="DD/MM/AA"
            />

            <InputField
              id="fone_number"
              name="fone_number"
              label="WHATSAPP / TELEFONE"
              type="text"
              placeholder="(53) 99999-9999"
            />

            <InputField
              id="cpf"
              name="cpf"
              label="CPF (Opcional)"
              type="text"
              placeholder="000.000.000-00"
            />

            <PasswordField
              id="senha"
              name="senha"
              label="SENHA"
              placeholder="••••••••"
              showForgotPassword={true}
            />

            <PasswordField
              id="confirmar-senha"
              name="confirmar-senha"
              label="CONFIRMAR SENHA"
              placeholder="••••••••"
              showForgotPassword={false}
            />

            <Button type="submit" variant="primary">
              Finalizar Cadastro
            </Button>

            <Button type="button" variant="secondary">
              Cancelar e Voltar
            </Button>
          </form>
        </div>

        <div className="signup-paciente-footer">
          <p>Precisa de ajuda? Fale com o Suporte Unimed</p>
        </div>
      </div>
    </div>
  );
}
