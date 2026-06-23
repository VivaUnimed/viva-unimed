import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import PasswordField from '../../components/ui/PasswordField';
import AppLogo from '../../components/layouts/AppLogo';
import './styles.css';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/authContext/authContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, demoLogin, authState } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Atualiza os estados conforme o usuário for digitando
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Verifica se a sessão foi expirada e mostra um alerta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      toast.warn('Sua sessão expirou!');

      // Limpa a URL para não mostrar o toast de novo se ele der F5
      window.history.replaceState({}, document.title, '/login');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() && !password.trim()) {
      demoLogin();
      navigate('/');
      return;
    }

    const userCredentials = {
      email,
      password,
    };

    await login(userCredentials);
  };

  return (
    <div className="login-paciente-page">
      <div className="login-paciente-card">
        <div className="login-paciente-header">
          <AppLogo size="small" />
        </div>

        <div className="login-paciente-content">
          <form className="login-paciente-form" onSubmit={handleLogin}>
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
              label="E-MAIL"
              type="email"
              placeholder="maria.silva@exemplo.com"
              value={email}
              onChange={handleEmailChange}
            />

            <PasswordField
              id="senha"
              name="senha"
              label="SENHA"
              placeholder="••••••••"
              showForgotPassword={true}
              onForgotPassword={() => navigate('/reset-password')}
              value={password}
              onChange={handlePasswordChange}
            />

            <Button type="submit" variant="primary" disabled={authState.isAuthenticating}>
              {authState.isAuthenticating ? 'Entrando...' : 'Entrar'}
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
