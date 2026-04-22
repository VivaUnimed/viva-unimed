import { NavLink, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import Input from '../../components/ui/input';
import Logo from '../../components/ui/Logo';
import PrimaryBtn from '../../components/ui/PrimaryBtn';
import { useAuth } from '../../context/authContext/authContext';
import './styles.css';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState } = useAuth();

  const location = useLocation();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const userLogin = (e) => {
    e.preventDefault();
    console.log('eux');

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
        <div className="welcome-login-section">
          <div className="welcome-login-section-content">
            <div className="logo-login-container">
              <Logo />
            </div>
            <h1 className="welcome-login-title">
              Agenda VivaUnimed <br />
              Sistema de Fila Inteligente
            </h1>
          </div>
        </div>
        <form className="login-section-form" onSubmit={userLogin}>
          <div className="title-form-container">
            <h1 className="form-title">Bem vindo</h1>
            <p>Acesse o Painel Administrativo para gerenciar sua agenda.</p>
          </div>
          <div className="form-inputs-login">
            <Input
              label={'E-mail Corporativo'}
              styles={{ minWidth: '150px' }}
              onChange={handleEmailChange}
              styles={{ minWidth: '150px' }}
            />
            <Input
              label={'Senha'}
              styles={{ width: '80%', minWidth: '150px' }}
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <a className="reset-password" href="/forgot-password">
            Esqueci a minha senha
          </a>
          <div className="login-section-button">
            <PrimaryBtn text={'Entrar no Painel'} styles={{ width: '250px' }} />
          </div>
        </form>
      </div>
    </div>
  );
}
