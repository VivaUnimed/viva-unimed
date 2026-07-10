import './styles.css';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext/authContext';
import AppLogo from '../../components/layouts/AppLogo';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, confirmPasswordReset, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!codeRequested) {
        await requestPasswordReset(email);
        setCodeRequested(true);
        return;
      }

      if (password !== confirmPassword) {
        toast.error('As senhas nao coincidem');
        return;
      }

      await confirmPasswordReset({
        email,
        token: resetCode,
        password,
      });
      navigate('/login');
    } catch {
      // A API ja mostra a mensagem de erro via toast.
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <header className="reset-password-header">
          <button
            type="button"
            className="reset-password-back"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={20} />
          </button>

          <AppLogo size="small" />
        </header>

        <main className="reset-password-content">
          <div className="reset-password-icon-box">
            <RotateCcw size={28} />
          </div>

          <section className="reset-password-title-group">
            <h1>Atualize sua senha</h1>

            <p>
              Informe seu e-mail para receber o codigo de recuperacao e criar
              uma nova senha de acesso.
            </p>
          </section>

          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="reset-password-input-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="nome@exemplo.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {codeRequested && (
              <>
                <div className="reset-password-input-group">
                  <label>Codigo recebido</label>
                  <input
                    type="text"
                    placeholder="Informe o codigo"
                    value={resetCode}
                    onChange={(event) => setResetCode(event.target.value)}
                    required
                  />
                </div>

                <div className="reset-password-input-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="reset-password-input-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="reset-password-button"
              disabled={authState.isLoading}
            >
              {codeRequested ? 'Salvar Nova Senha' : 'Enviar Codigo'}
              <CheckCircle2 size={18} />
            </button>
          </form>

          <button
            type="button"
            className="reset-password-login-link"
            onClick={() => navigate('/login')}
          >
            Voltar para o Login
          </button>
        </main>

        <footer className="reset-password-footer">
          <div className="reset-password-status">
            <span className="status-dot"></span>
            <span>SISTEMA INTELIGENTE ATIVO</span>
          </div>

          <div className="reset-password-footer-logo">
            <AppLogo size="small" />
          </div>
        </footer>
      </div>
    </div>
  );
}
