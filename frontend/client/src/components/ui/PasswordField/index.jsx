import './styles.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { useState } from 'react';

export default function PasswordField({
  id,
  label,
  name,
  placeholder = '••••••••',
  value,
  onChange,
  showForgotPassword = false,
  onForgotPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-field-wrapper">
      <div className="password-field-header">
        {label && <label htmlFor={id}>{label}</label>}

        {showForgotPassword && (
          <button
            type="button"
            className="forgot-password-btn"
            onClick={onForgotPassword}
          >
            ESQUECI MINHA SENHA
          </button>
        )}
      </div>

      <div className="password-field-group">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          className="show-password-btn"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
      </div>
    </div>
  );
}
