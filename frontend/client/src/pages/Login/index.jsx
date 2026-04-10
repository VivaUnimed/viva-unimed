import "./styles.css";
import { FaRegEye, FaLock, FaPlusSquare } from "react-icons/fa";

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
            <div className="input-group">
              <label htmlFor="documento">CPF OU E-MAIL</label>
              <input
                id="documento"
                type="text"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="password-header">
              <label htmlFor="senha">SENHA</label>
              <button type="button" className="forgot-password-btn">
                ESQUECI MINHA SENHA
              </button>
            </div>

            <div className="input-group password-group">
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="show-password-btn"
                aria-label="Mostrar senha"
              >
                <FaRegEye />
              </button>
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>

            <button type="button" className="btn-secondary">
              Criar Conta
            </button>
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