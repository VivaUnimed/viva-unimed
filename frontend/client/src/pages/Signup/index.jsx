import { NavLink } from 'react-router';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import PasswordField from '../../components/ui/PasswordField';
import { useAuth } from '../../context/authContext/authContext';
import './styles.css';
import { FaPlusSquare } from 'react-icons/fa';
import { useState } from 'react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cpf, setCpf] = useState('');
  const { signup, authState } = useAuth();

  // Atualiza os estados conforme o usuário for digitando
  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const handleDateOfBirthChange = (e) => setDateOfBirth(e.target.value);
  const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value);
  const handleCpfChange = (e) => setCpf(e.target.value);

  const userSignup = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    const userCredentials = {
      email,
      password,
      name: fullName,
      date_of_birth: dateOfBirth,
      phone_number: phoneNumber,
      cpf,
    };

    signup(userCredentials);
  };

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
          <form className="signup-paciente-form" onSubmit={userSignup}>
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
              value={fullName}
              onChange={handleFullNameChange}
            />

            <InputField
              id="email"
              name="email"
              label="E-MAIL DE CONTATO"
              type="email"
              placeholder="maria.silva@exemplo.com"
              value={email}
              onChange={handleEmailChange}
            />

            <InputField
              id="date_of_birth"
              name="date_of_birth"
              label="DATA DE NASCIMENTO"
              type="date"
              placeholder="DD/MM/AA"
              value={dateOfBirth}
              onChange={handleDateOfBirthChange}
            />

            <InputField
              id="fone_number"
              name="fone_number"
              label="WHATSAPP / TELEFONE"
              type="text"
              placeholder="(53) 99999-9999"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />

            <InputField
              id="cpf"
              name="cpf"
              label="CPF (Opcional)"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
            />

            <PasswordField
              id="senha"
              name="senha"
              label="SENHA"
              placeholder="••••••••"
              showForgotPassword={false}
              value={password}
              onChange={handlePasswordChange}
            />

            <PasswordField
              id="confirmar-senha"
              name="confirmar-senha"
              label="CONFIRMAR SENHA"
              placeholder="••••••••"
              showForgotPassword={false}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />

            <Button type="submit" variant="primary">
              Finalizar Cadastro
            </Button>

            <NavLink to="/login">
              <Button type="button" variant="secondary">
                Fazer Login
              </Button>
            </NavLink>
          </form>
        </div>

        <div className="signup-paciente-footer">
          <p>Precisa de ajuda? Fale com o Suporte Unimed</p>
        </div>
      </div>
    </div>
  );
}
