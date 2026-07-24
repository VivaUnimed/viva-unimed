import { NavLink, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LuMail, LuLock, LuEye, LuEyeOff, LuBadgeAlert } from 'react-icons/lu';
import Logo from '../../components/ui/Logo';
import { useAuth } from '../../context/authContext/authContext';
import './styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, authState } = useAuth();
  const location = useLocation();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePassword = () => setShowPassword(!showPassword);

  const userLogin = (e) => {
    e.preventDefault();
    const userCredentials = {
      email,
      password,
    };
    login(userCredentials);
  };

  // Verifica se a sessão foi expirada e mostra um alerta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      toast.warn('Sua sessão expirou!');
      // Limpa a URL para não mostrar o toast de novo se ele der F5
      window.history.replaceState({}, document.title, '/login');
    }
  }, [location]);

  return (
    <div className="login-container">
      <div className="login-content">
        
        {/* Left Side: Institutional */}
        <div className="login-institutional">
          <div className="login-institutional__content">
            <div className="login-institutional__logo">
              <Logo />
            </div>
            <div className="login-institutional__text">
              <h1>Agenda VivaUnimed</h1>
              <h2>Sistema de Fila Inteligente</h2>
              <p>Gestão inteligente de vagas remanescentes, fila de espera e confirmação de consultas.</p>
            </div>
            {/* Elementos decorativos (opcionais via CSS) */}
            <div className="login-institutional__decor-circle-1"></div>
            <div className="login-institutional__decor-circle-2"></div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-container">
          <form className="login-form" onSubmit={userLogin}>
            
            <div className="login-form__header">
              <h1>Bem-vindo de volta</h1>
              <p>Acesse o painel administrativo da Agenda VivaUnimed.</p>
            </div>

            {/* Error Message */}
            {authState?.error && (
              <div className="login-form__error">
                <LuBadgeAlert size={20} />
                <span>{authState.error}</span>
              </div>
            )}

            <div className="login-form__fields">
              <div className="login-input-group">
                <label htmlFor="email">E-mail corporativo</label>
                <div className="login-input-wrapper">
                  <LuMail className="login-input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    placeholder="voce@unimed.coop.br"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="password">Senha</label>
                <div className="login-input-wrapper">
                  <LuLock className="login-input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha de acesso"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={togglePassword}
                    tabIndex="-1"
                  >
                    {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="login-form__support">
              <p>Problemas para acessar? Contate o administrador do sistema.</p>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={authState?.isAuthenticating || authState?.isLoading}
            >
              {(authState?.isAuthenticating || authState?.isLoading) ? (
                <div className="login-spinner"></div>
              ) : (
                'Entrar no painel'
              )}
            </button>

            <p className="login-footer-notice">
              Acesso restrito a usuários administrativos autorizados.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
