import './styles.css';
import logo from '../../../assets/logo.png'

export default function Logo({ styles={} }) {
  return (
    <div className="logo-container">
      <div className="logo-icon" style={styles}>
        <img src={logo} alt="" />
      </div>
    </div>
  );
}