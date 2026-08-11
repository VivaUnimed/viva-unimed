import { useEffect, useState } from 'react';
import { LuChevronLeft, LuPencilLine, LuTrash2 } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import ProfessionalNotFound from '../../components/professionals/ProfessionalNotFound';
import {
  formatProfessionalRegistration,
} from '../../data/professionals';
import { useProfessionals } from '../../context/professionalContext/professionalContext';
import { formatCpf, formatPhone } from '../../utils/patients/patientFormatters';
import './styles.css';

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return value;
};

const formatPhoneValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return formatPhone(String(value));
};

const formatCpfValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return formatCpf(String(value));
};

export default function ProfessionalDetails() {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const { getProfessionalById, deleteProfessional } = useProfessionals();
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfessional = async () => {
      setIsLoading(true);
      setLoadError('');
      setActionError('');
      setProfessional(null);
      setIsNotFound(false);

      try {
        const loadedProfessional = await getProfessionalById(professionalId);

        if (!isMounted) {
          return;
        }

        setProfessional(loadedProfessional);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error?.message === 'NotFound') {
          setIsNotFound(true);
          setProfessional(null);
          return;
        }

        setLoadError(
          error?.message || 'Não foi possível carregar o profissional no momento.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfessional();

    return () => {
      isMounted = false;
    };
  }, [professionalId]);

  const handleDelete = async () => {
    if (!professional) {
      return;
    }

    const hasConfirmedDeletion = window.confirm(
      `Deseja remover o vínculo profissional de ${professional.name}? O backend atual exclui apenas o registro de doctor; o usuário vinculado permanece cadastrado.`,
    );

    if (!hasConfirmedDeletion) {
      return;
    }

    setIsDeleting(true);
    setActionError('');

    try {
      await deleteProfessional(professional.id);
      navigate('/professionals', {
        state: {
          successMessage: `Vínculo profissional de ${professional.name} removido com sucesso.`,
        },
      });
    } catch (error) {
      setActionError(
        error?.message || 'Não foi possível remover o vínculo profissional.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="professional-details-page">
        <section className="professional-details-card">
          <p className="professional-details-message">Carregando profissional...</p>
        </section>
      </main>
    );
  }

  if (isNotFound) {
    return <ProfessionalNotFound />;
  }

  if (loadError && !professional) {
    return (
      <main className="professional-details-page">
        <section className="professional-details-card">
          <p className="professional-details-message">{loadError}</p>
        </section>
      </main>
    );
  }

  if (!professional) {
    return <ProfessionalNotFound />;
  }

  return (
    <main className="professional-details-page">
      <section className="professional-details-header">
        <div>
          <button
            type="button"
            className="professional-details-back-button"
            onClick={() => navigate('/professionals')}
          >
            <LuChevronLeft size={18} />
            Voltar para gestão de profissionais
          </button>
        </div>
      </section>

      {actionError ? (
        <section className="professional-details-card professional-details-card--error">
          <p className="professional-details-message">{actionError}</p>
        </section>
      ) : null}

      <section className="professional-details-card">
        <header className="professional-details-card__header">
          <div className="professional-details-identity">
            <img src={professional.avatar} alt={professional.name} />

            <div>
              <span className="professional-details-identity__badge">
                Ficha do profissional
              </span>
              <h1>{professional.name}</h1>
              <p>{professional.email}</p>
            </div>
          </div>

          <div className="professional-details-actions">
            <button
              type="button"
              className="professional-details-edit-button"
              onClick={() => navigate(`/professionals/${professional.id}/edit`)}
            >
              <LuPencilLine size={16} />
              Editar profissional
            </button>

            <button
              type="button"
              className="professional-details-delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <LuTrash2 size={16} />
              {isDeleting ? 'Removendo...' : 'Excluir vínculo'}
            </button>
          </div>
        </header>

        <div className="professional-details-grid">
          <article className="professional-details-field">
            <span>Nome</span>
            <strong>{formatValue(professional.name)}</strong>
          </article>

          <article className="professional-details-field">
            <span>CRM</span>
            <strong>{formatProfessionalRegistration(professional)}</strong>
          </article>

          <article className="professional-details-field">
            <span>Telefone</span>
            <strong>{formatPhoneValue(professional.phone)}</strong>
          </article>

          <article className="professional-details-field">
            <span>E-mail</span>
            <strong>{formatValue(professional.email)}</strong>
          </article>

          <article className="professional-details-field">
            <span>CPF</span>
            <strong>{formatCpfValue(professional.cpf)}</strong>
          </article>

          <article className="professional-details-field">
            <span>Status</span>
            <div>
              <span
                className={`professional-details-status professional-details-status--${toSlug(professional.status)}`}
              >
                {professional.status}
              </span>
            </div>
          </article>

          <article className="professional-details-field">
            <span>ID do profissional</span>
            <strong>{formatValue(professional.id)}</strong>
          </article>

          <article className="professional-details-field professional-details-field--wide">
            <span>Especialidades</span>
            <div className="professional-details-specialties">
              {professional.specialities.length > 0 ? (
                professional.specialities.map((speciality) => (
                  <span
                    key={speciality.id}
                    className="professional-details-specialty-badge"
                  >
                    {speciality.name}
                  </span>
                ))
              ) : (
                <strong>Sem especialidades vinculadas.</strong>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
