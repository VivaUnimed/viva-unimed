const avatarPalettes = [
  { background: '#d8f3e8', foreground: '#0f6b47' },
  { background: '#e0f2fe', foreground: '#0f4c81' },
  { background: '#fef3c7', foreground: '#92400e' },
  { background: '#fce7f3', foreground: '#9d174d' },
];

const pickAvatarPalette = (name = '') => {
  const total = String(name)
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

  return avatarPalettes[total % avatarPalettes.length];
};

const getProfessionalInitials = (name = '') => {
  const [firstName = '', secondName = ''] = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return `${firstName[0] || ''}${secondName[0] || firstName[1] || ''}`.toUpperCase();
};

const normalizePhone = (value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return String(value).trim();
};

const normalizeSpeciality = (speciality = {}) => ({
  id: Number(speciality.id),
  name: speciality.name ?? '',
});

export const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const createProfessionalAvatar = (name = '') => {
  const { background, foreground } = pickAvatarPalette(name);
  const initials = getProfessionalInitials(name) || 'PR';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label="${initials}">
      <rect width="80" height="80" rx="40" fill="${background}" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Inter, Arial, sans-serif"
        font-size="30"
        font-weight="700"
        fill="${foreground}"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const professionalStatusOptions = ['Ativo', 'Inativo'];

export const mapDoctorToProfessional = (doctor = {}) => {
  const specialities = Array.isArray(doctor.specialities)
    ? doctor.specialities.map(normalizeSpeciality).filter((speciality) => speciality.name)
    : [];
  const name = doctor.name ?? '';

  return {
    id: Number(doctor.id),
    userId: Number(doctor.id),
    name,
    email: doctor.email ?? '',
    phone: normalizePhone(doctor.phone),
    cpf: doctor.cpf ?? '',
    crm: String(doctor.crm ?? '').trim(),
    enabled: Boolean(doctor.enabled),
    status: doctor.enabled ? 'Ativo' : 'Inativo',
    specialities,
    specialties: specialities.map((speciality) => speciality.name),
    specialityIds: specialities.map((speciality) => speciality.id),
    avatar: createProfessionalAvatar(name || 'Profissional'),
  };
};

export const mergeProfessionalWithUser = (doctor = {}, user = {}) =>
  mapDoctorToProfessional({
    ...doctor,
    name: user.name ?? doctor.name,
    email: user.email ?? doctor.email,
    phone: user.phone ?? doctor.phone,
    cpf: user.cpf ?? doctor.cpf,
  });

export const formatProfessionalRegistration = (professional = {}) => {
  const crm = String(professional.crm ?? '').trim();

  return crm || '-';
};

export const getProfessionalSpecialtyFilterOptions = (professionals = []) => {
  const specialtyOptions = new Set();

  professionals.forEach((professional) => {
    (professional.specialties ?? []).forEach((specialtyName) => {
      if (specialtyName) {
        specialtyOptions.add(specialtyName);
      }
    });
  });

  return [...specialtyOptions].sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, 'pt-BR'),
  );
};

export const getProfessionalSpecialtyOptions = (
  availableSpecialties = [],
  selectedSpecialties = [],
) => {
  const options = new Map();

  [...availableSpecialties, ...selectedSpecialties].forEach((speciality) => {
    if (!speciality) {
      return;
    }

    const normalizedSpeciality =
      typeof speciality === 'object'
        ? { id: Number(speciality.id), name: speciality.name ?? '' }
        : null;

    if (!normalizedSpeciality?.id || !normalizedSpeciality.name) {
      return;
    }

    options.set(normalizedSpeciality.id, normalizedSpeciality);
  });

  return [...options.values()].sort((firstValue, secondValue) =>
    firstValue.name.localeCompare(secondValue.name, 'pt-BR'),
  );
};

export const getProfessionalFormInitialValues = (professional = null) => ({
  name: professional?.name ?? '',
  email: professional?.email ?? '',
  phone: professional?.phone ?? '',
  cpf: professional?.cpf ?? '',
  crm: String(professional?.crm ?? ''),
  status: professional?.status ?? 'Ativo',
  specialityIds: Array.isArray(professional?.specialityIds)
    ? professional.specialityIds.map((specialityId) => Number(specialityId))
    : Array.isArray(professional?.specialities)
      ? professional.specialities.map((speciality) => Number(speciality.id))
      : [],
});
