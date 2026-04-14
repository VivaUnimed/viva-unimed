import './styles.css';

export default function InputField({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
}) {
  return (
    <div className="input-field-group">
      {label && <label htmlFor={id}>{label}</label>}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
