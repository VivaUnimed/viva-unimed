import "./styles.css";
import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";
import { useAuth } from "../../context/authContext/authContext";

import {
  ArrowLeft,
  Camera,
  Calendar,
  LogOut,
} from "lucide-react";

export default function Perfil() {
  const { logout, authState } = useAuth();

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <header className="perfil-header">
          <button type="button" className="perfil-back-btn">
            <ArrowLeft size={22} />
          </button>

          <AppLogo size="small" />
        </header>

        <main className="perfil-content">
          <section className="perfil-photo-section">
            <div className="perfil-photo-wrapper">
              <div className="perfil-photo"></div>

              <button type="button" className="perfil-camera-btn">
                <Camera size={16} />
              </button>
            </div>

            <button type="button" className="perfil-change-photo-btn">
              TROCAR FOTO
            </button>
          </section>

          <form className="perfil-form">
            <div className="perfil-input-group">
              <label>NOME COMPLETO</label>

              <input type="text" value="Mariana Silva Oliveira" readOnly />
            </div>

            <div className="perfil-input-group">
              <label>E-MAIL</label>

              <input type="email" value="mariana.silva@email.com.br" readOnly />
            </div>

            <div className="perfil-input-group">
              <label>WHATSAPP / TELEFONE</label>

              <input type="text" value="(47) 99876-5432" readOnly />
            </div>

            <div className="perfil-input-group">
              <label>CPF</label>

              <input type="text" value="000.000.000-00" readOnly />
            </div>

            <div className="perfil-input-group">
              <label>DATA DE NASCIMENTO</label>

              <div className="perfil-date-input">
                <input type="text" value="24/08/1985" readOnly />

                <Calendar size={18} />
              </div>
            </div>

            <button type="submit" className="perfil-save-btn">
              Salvar Alteracoes
            </button>

            <button
              type="button"
              className="perfil-logout-btn"
              onClick={logout}
              disabled={authState.isLoading}
            >
              <LogOut size={18} />
              Sair
            </button>
          </form>
        </main>

        <AppNav className="perfil-bottom-nav" active="perfil" />
      </div>
    </div>
  );
}
