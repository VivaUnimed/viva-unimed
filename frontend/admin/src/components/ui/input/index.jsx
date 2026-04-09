import './styles.css';

export default function Input({ type='text', value, onChange, id, placeholder, label, styles}) {

  return (
    <div className="input-container" style={styles}>
      {label && <label htmlFor={id}>{label}</label>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        id={id} 
        name={id} 
        placeholder={placeholder} 
        style={styles}
        required 
      />
    </div>
  );
}