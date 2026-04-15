import { NavLink } from 'react-router';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import PasswordField from '../../components/ui/PasswordField';
import './styles.css';
import { FaLock, FaPlusSquare } from 'react-icons/fa';

export default function Login() {
  return (
    <div className="login-paciente-page">
      <div className="login-paciente-card">
        <div className="login-paciente-header">
          <div className="login-paciente-logo-icon">
            <FaPlusSquare />
          </div>

          <div className="login-paciente-brand">
            <h2>UNIMED</h2>
            <span>LITORAL SUL</span>
          </div>
        </div>

        <div className="login-paciente-content">
          <form className="login-paciente-form">
            <div className="login-paciente-title-group">
              <h1>
                Agenda
                <br />
                <span>VivaUnimed</span>
              </h1>
              <p>Sua saúde, gerenciada com inteligência.</p>
            </div>

            <InputField
              id="documento"
              name="documento"
              label="CPF OU E-MAIL"
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

            <Button type="submit" variant="primary">
              Entrar
            </Button>

            <NavLink to="/signup">
              <Button type="button" variant="secondary">
                Criar Conta
              </Button>
            </NavLink>
          </form>

          <div className="login-paciente-security">
            <FaLock />
            <span>ACESSO SEGURO CRIPTOGRAFADO</span>
          </div>
        </div>

        <div className="login-paciente-footer">
          <p>Precisa de ajuda? Fale com o Suporte Unimed</p>
        </div>
      </div>
    </div>
  );
}
