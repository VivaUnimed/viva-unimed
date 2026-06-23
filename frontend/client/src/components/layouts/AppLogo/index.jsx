import "./styles.css";
import unimedLogo from "../../../unimed.png";

export default function AppLogo({ size = "small", className = "" }) {
  return (
    <div
      className={`app-logo app-logo-${size} ${className}`}
      role="img"
      aria-label="VivaUnimed"
      style={{ backgroundImage: `url(${unimedLogo})` }}
    />
  );
}
