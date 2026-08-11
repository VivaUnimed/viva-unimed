import "./styles.css";

import AppNav from "../../components/layouts/AppNav";
import AppLogo from "../../components/layouts/AppLogo";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Camera } from "lucide-react";

import {
  getProfile,
  updateProfile,
} from "../../api/profileApi";

const emptyForm = {
  name: "",
  email: "",
  ddd: "",
  phoneNumber: "",
  cpf: "",
  birthDate: "",
};

const emptyProfile = {
  id: null,
  userId: null,
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
};

const onlyNumbers = (value = "") => {
  return String(value).replace(/\D/g, "");
};

/**
 * Recupera o usuário salvo pelo login.
 *
 * É utilizado como alternativa caso o endpoint de perfil
 * não devolva o ID por algum motivo.
 */
const getStoredUser = () => {
  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const formatCpf = (value) => {
  const numbers = onlyNumbers(value).slice(0, 11);

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(
      /^(\d{3})\.(\d{3})(\d)/,
      "$1.$2.$3",
    )
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

const formatPhone = (value) => {
  const numbers = onlyNumbers(value).slice(0, 9);

  if (numbers.length <= 4) {
    return numbers;
  }

  if (numbers.length <= 8) {
    return numbers.replace(
      /^(\d{4})(\d+)/,
      "$1-$2",
    );
  }

  return numbers.replace(
    /^(\d{5})(\d+)/,
    "$1-$2",
  );
};

const getPhoneParts = (phone = "") => {
  const numbers = onlyNumbers(phone);

  return {
    ddd: numbers.slice(0, 2),
    phoneNumber: formatPhone(numbers.slice(2)),
  };
};

/**
 * Converte uma data recebida como:
 *
 * 2000-05-20
 * 2000-05-20T00:00:00.000Z
 *
 * para:
 *
 * 20/05/2000
 */
const formatBirthForForm = (birthDate) => {
  if (!birthDate) {
    return "";
  }

  const value = String(birthDate);

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  const dateOnly = value.split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-");

    return `${day}/${month}/${year}`;
  }

  return value;
};

const isValidDate = (value) => {
  const match = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  );

  if (!match) {
    return false;
  }

  const [, dayText, monthText, yearText] =
    match;

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (
    month < 1 ||
    month > 12 ||
    year < 1900
  ) {
    return false;
  }

  const maximumDay = new Date(
    year,
    month,
    0,
  ).getDate();

  return day >= 1 && day <= maximumDay;
};

const validateForm = (formData) => {
  const errors = {};

  const filledName = formData.name.trim();
  const filledEmail = formData.email.trim();
  const ddd = onlyNumbers(formData.ddd);
  const phoneNumber = onlyNumbers(
    formData.phoneNumber,
  );

  if (
    filledName &&
    !filledName
      .split(/\s+/)
      .every((word) =>
        /^\p{Lu}[\p{L}'’-]*$/u.test(word),
      )
  ) {
    errors.name =
      "Todas as palavras devem começar com letra maiúscula.";
  }

  if (
    filledEmail &&
    !/^[^\s@]+@[^\s@]+\.(?:com|br)$/i.test(
      filledEmail,
    )
  ) {
    errors.email =
      "Informe um e-mail válido terminado em .com ou .br.";
  }

  if (
    (ddd || phoneNumber) &&
    ddd.length !== 2
  ) {
    errors.ddd =
      "O DDD deve ter 2 números.";
  }

  if (
    (ddd || phoneNumber) &&
    ![8, 9].includes(phoneNumber.length)
  ) {
    errors.phoneNumber =
      "O telefone deve ter 8 ou 9 números.";
  }

  if (
    formData.cpf &&
    !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(
      formData.cpf,
    )
  ) {
    errors.cpf =
      "Use exatamente o formato XXX.XXX.XXX-XX.";
  }

  if (
    formData.birthDate &&
    !isValidDate(formData.birthDate)
  ) {
    errors.birthDate =
      "Informe uma data válida no formato DD/MM/AAAA.";
  }

  return errors;
};

export default function PerfilEditar() {
  const navigate = useNavigate();

  const [currentProfile, setCurrentProfile] =
    useState(emptyProfile);

  const [formData, setFormData] =
    useState(emptyForm);

  const [errors, setErrors] = useState({});

  const currentPhone = getPhoneParts(
    currentProfile.phone,
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        const storedUser = getStoredUser();

        /*
         * O GET /api/user/me devolve users.id.
         *
         * Também usamos o usuário salvo no login como
         * alternativa para garantir que o ID não seja perdido.
         */
        const userId =
          data?.userId ??
          data?.id ??
          storedUser?.id ??
          null;

        const loadedProfile = {
          id:
            data?.id ??
            storedUser?.id ??
            null,

          userId,

          name:
            data?.name ??
            storedUser?.name ??
            "",

          email:
            data?.email ??
            storedUser?.email ??
            "",

          phone:
            data?.phone ??
            storedUser?.phone ??
            "",

          cpf:
            data?.cpf ??
            storedUser?.cpf ??
            "",

          birthDate: formatBirthForForm(
            data?.birthDate ?? data?.birth ?? "",
          ),
        };

        console.log(
          "Perfil carregado para edição:",
          loadedProfile,
        );

        setCurrentProfile(loadedProfile);

        const phoneParts = getPhoneParts(
          loadedProfile.phone,
        );

        setFormData({
          name: loadedProfile.name,
          email: loadedProfile.email,
          ddd: phoneParts.ddd,
          phoneNumber: phoneParts.phoneNumber,
          cpf: formatCpf(loadedProfile.cpf),
          birthDate: loadedProfile.birthDate,
        });
      } catch (error) {
        console.warn(
          "Erro ao carregar perfil para edição:",
          error.message,
        );
      }
    };

    loadProfile();
  }, []);

  const handleChange = ({
    target: { name, value },
  }) => {
    let formattedValue = value;

    if (name === "ddd") {
      formattedValue = onlyNumbers(value).slice(
        0,
        2,
      );
    }

    if (name === "phoneNumber") {
      formattedValue = formatPhone(value);
    }

    if (name === "cpf") {
      formattedValue = formatCpf(value);
    }

    if (name === "birthDate") {
      formattedValue = onlyNumbers(value)
        .slice(0, 8)
        .replace(
          /^(\d{2})(\d)/,
          "$1/$2",
        )
        .replace(
          /^(\d{2})\/(\d{2})(\d)/,
          "$1/$2/$3",
        );
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: formattedValue,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors =
      validateForm(formData);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    const ddd = onlyNumbers(formData.ddd);

    const phoneNumber = onlyNumbers(
      formData.phoneNumber,
    );

    const hasNewPhone =
      Boolean(ddd) || Boolean(phoneNumber);

    /*
     * A correção mais importante está aqui:
     *
     * id e userId precisam continuar no objeto
     * enviado para updateProfile().
     */
    const updatedProfile = {
      id: currentProfile.id,

      userId:
        currentProfile.userId ??
        currentProfile.id,

      name:
        formData.name.trim() ||
        currentProfile.name,

      email:
        formData.email.trim() ||
        currentProfile.email,

      phone: hasNewPhone
        ? `${ddd}${phoneNumber}`
        : currentProfile.phone,

      cpf:
        formData.cpf ||
        currentProfile.cpf,

      birthDate:
        formData.birthDate ||
        currentProfile.birthDate,
    };

    console.log(
      "Perfil enviado para atualização:",
      updatedProfile,
    );

    try {
      const savedProfile =
        await updateProfile(updatedProfile);

      setCurrentProfile((currentData) => ({
        ...currentData,
        ...savedProfile,

        /*
         * Preserva os identificadores caso o PUT
         * não os devolva na resposta.
         */
        id:
          savedProfile?.id ??
          currentData.id,

        userId:
          savedProfile?.userId ??
          currentData.userId ??
          currentData.id,

        birthDate:
          savedProfile?.birthDate ??
          currentData.birthDate,
      }));

      navigate("/perfil");
    } catch (error) {
      console.warn(
        "Erro ao atualizar perfil:",
        error.message,
      );
    }
  };

  return (
    <div className="perfil-page perfil-edit-page">
      <div className="perfil-card">
        <header className="perfil-header">
          <button
            type="button"
            className="perfil-back-btn"
            onClick={() => navigate("/perfil")}
            aria-label="Voltar para o perfil"
          >
            <ArrowLeft size={22} />
          </button>

          <AppLogo size="small" />
        </header>

        <main className="perfil-content">
          <section className="perfil-photo-section">
            <div className="perfil-photo-wrapper">
              <div className="perfil-photo" />

              <button
                type="button"
                className="perfil-camera-btn"
                aria-label="Alterar foto"
              >
                <Camera size={16} />
              </button>
            </div>

            <button
              type="button"
              className="perfil-change-photo-btn"
            >
              TROCAR FOTO
            </button>
          </section>

          <form
            className="perfil-form"
            onSubmit={handleSubmit}
          >
            <div
              className={`perfil-input-group ${
                errors.name
                  ? "has-error"
                  : ""
              }`}
            >
              <label htmlFor="profile-name">
                NOME COMPLETO
              </label>

              <input
                id="profile-name"
                name="name"
                type="text"
                value={formData.name}
                placeholder={currentProfile.name}
                onChange={handleChange}
                aria-invalid={Boolean(
                  errors.name,
                )}
              />

              {errors.name && (
                <span className="perfil-field-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div
              className={`perfil-input-group ${
                errors.email
                  ? "has-error"
                  : ""
              }`}
            >
              <label htmlFor="profile-email">
                E-MAIL
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={formData.email}
                placeholder={currentProfile.email}
                onChange={handleChange}
                aria-invalid={Boolean(
                  errors.email,
                )}
              />

              {errors.email && (
                <span className="perfil-field-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="perfil-input-group">
              <label htmlFor="profile-phone">
                WHATSAPP / TELEFONE
              </label>

              <div className="perfil-phone-inputs">
                <div
                  className={`perfil-phone-field perfil-ddd-field ${
                    errors.ddd
                      ? "has-error"
                      : ""
                  }`}
                >
                  <input
                    id="profile-ddd"
                    name="ddd"
                    type="tel"
                    inputMode="numeric"
                    value={formData.ddd}
                    placeholder={
                      currentPhone.ddd
                    }
                    onChange={handleChange}
                    aria-label="DDD"
                    aria-invalid={Boolean(
                      errors.ddd,
                    )}
                  />

                  <span className="perfil-phone-field-label">
                    DDD
                  </span>
                </div>

                <div
                  className={`perfil-phone-field ${
                    errors.phoneNumber
                      ? "has-error"
                      : ""
                  }`}
                >
                  <input
                    id="profile-phone"
                    name="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    value={
                      formData.phoneNumber
                    }
                    placeholder={
                      currentPhone.phoneNumber
                    }
                    onChange={handleChange}
                    aria-label="Número do telefone"
                    aria-invalid={Boolean(
                      errors.phoneNumber,
                    )}
                  />

                  <span className="perfil-phone-field-label">
                    NÚMERO
                  </span>
                </div>
              </div>

              {(errors.ddd ||
                errors.phoneNumber) && (
                <span className="perfil-field-error">
                  {errors.ddd ||
                    errors.phoneNumber}
                </span>
              )}
            </div>

            <div
              className={`perfil-input-group ${
                errors.cpf
                  ? "has-error"
                  : ""
              }`}
            >
              <label htmlFor="profile-cpf">
                CPF
              </label>

              <input
                id="profile-cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                placeholder={currentProfile.cpf}
                readOnly
                title="O CPF não pode ser alterado pelo perfil."
              />
              <span className="perfil-field-help">
                Para alterar o CPF, entre em contato com o atendimento.
              </span>

              
            </div>

            <div
              className={`perfil-input-group ${
                errors.birthDate
                  ? "has-error"
                  : ""
              }`}
            >
              <label htmlFor="profile-birth-date">
                DATA DE NASCIMENTO
              </label>

              <div className="perfil-date-input">
                <input
                  id="profile-birth-date"
                  name="birthDate"
                  type="text"
                  inputMode="numeric"
                  value={formData.birthDate}
                  placeholder={
                    currentProfile.birthDate
                  }
                  onChange={handleChange}
                  maxLength={10}
                  aria-invalid={Boolean(
                    errors.birthDate,
                  )}
                />

                <Calendar size={18} />
              </div>

              {errors.birthDate && (
                <span className="perfil-field-error">
                  {errors.birthDate}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="perfil-save-btn"
            >
              Salvar alterações
            </button>

            <button
              type="button"
              className="perfil-cancel-btn"
              onClick={() =>
                navigate("/perfil")
              }
            >
              Cancelar
            </button>
          </form>
        </main>

        <AppNav
          className="perfil-bottom-nav"
          active="perfil"
        />
      </div>
    </div>
  );
}