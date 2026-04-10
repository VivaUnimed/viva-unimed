import Input from '../../components/ui/input';
import Logo from '../../components/ui/Logo';
import PrimaryBtn from '../../components/ui/PrimaryBtn';
import './styles.css';

export default function Login() {
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
        <div className="login-section-form">
          <div className="title-form-container">
            <h1 className="form-title">Bem vindo</h1>
            <p>Acesse o Painel Administrativo para gerenciar sua agenda.</p>
          </div>
          <div className="form-inputs-login">
            <Input
              label={'E-mail Corporativo'}
              styles={{ minWidth: '150px' }}
            />
            <Input
              label={'Senha'}
              styles={{ width: '80%', minWidth: '150px' }}
            />
          </div>
          <a className="reset-password" href="">
            Esqueci a minha senha
          </a>
          <div className="login-section-button">
            <PrimaryBtn text={'Entrar no Painel'} styles={{width: '250px'}}/>
          </div>
        </div>
      </div>
    </div>
  );
}
