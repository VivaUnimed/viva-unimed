const avatarPalettes = [
  { background: '#d8f3e8', foreground: '#0f6b47' },
  { background: '#ffe6cf', foreground: '#975a16' },
  { background: '#e2e8f0', foreground: '#1e3a5f' },
  { background: '#fce7f3', foreground: '#9d174d' },
];

const pickAvatarPalette = (name = '') => {
  const total = name
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

  return avatarPalettes[total % avatarPalettes.length];
};

const getPatientInitials = (name = '') => {
  const [firstName = '', secondName = ''] = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return `${firstName[0] || ''}${secondName[0] || firstName[1] || ''}`.toUpperCase();
};

export const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const formatCpf = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length !== 11) {
    return value.trim();
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return value.trim();
};

export const isPhoneValid = (value = '') => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
};

export const splitPatientInterests = (value = []) =>
  (Array.isArray(value) ? value : value.split(','))
    .map((interest) => interest.trim())
    .filter(Boolean);

export const createPatientAvatar = (name = '') => {
  const { background, foreground } = pickAvatarPalette(name);
  const initials = getPatientInitials(name) || 'NP';
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

export const patientStatusOptions = ['Ativo', 'Em fila', 'Inativo'];

const basePatientSpecialtyOptions = [
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Pediatria',
  'Ginecologia',
  'Clínica Médica',
  'Nutrologia',
];

export const defaultPatients = [
  {
    id: 1,
    name: 'Beatriz Helena Ferreira',
    cpf: '123.***.***-01',
    phone: '(53) 99999-0001',
    email: 'beatriz@email.com',
    phoneValid: true,
    interests: ['Dermatologia', 'Cardiologia'],
    status: 'Ativo',
    lastNotificationDate: '12 Mai, 2024',
    lastNotificationStatus: 'Enviada',
    lastConfirmationDate: '18 Jun, 2024',
    lastConfirmationSpecialty: 'Dermatologia',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Ricardo Mendes Albuquerque',
    cpf: '892.***.***-45',
    phone: '(53) 99999-1120',
    email: 'ricardo.mendes@email.com',
    phoneValid: false,
    interests: ['Ortopedia', 'Fisiatria'],
    status: 'Em fila',
    lastNotificationDate: '16 Jun, 2024',
    lastNotificationStatus: 'Falhou',
    lastConfirmationDate: '',
    lastConfirmationSpecialty: '',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Joaquim de Souza Neto',
    cpf: '541.***.***-22',
    phone: '(53) 98888-4321',
    email: 'joaquim.neto@email.com',
    phoneValid: true,
    interests: ['Neurologia', 'Clínica Médica', 'Cardiologia'],
    status: 'Inativo',
    lastNotificationDate: 'Sem envio',
    lastNotificationStatus: 'Sem envio',
    lastConfirmationDate: '',
    lastConfirmationSpecialty: '',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Mariana Luzia Santos',
    cpf: '211.***.***-98',
    phone: '(53) 99777-2054',
    email: 'mariana.luzia@email.com',
    phoneValid: true,
    interests: ['Nutrologia', 'Endocrinologia'],
    status: 'Ativo',
    lastNotificationDate: '18 Jun, 2024',
    lastNotificationStatus: 'Enviada',
    lastConfirmationDate: '18 Jun, 2024',
    lastConfirmationSpecialty: 'Nutrologia',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 5,
    name: 'Ana Carolina Rocha',
    cpf: '734.***.***-63',
    phone: '(53) 99666-7810',
    email: 'ana.rocha@email.com',
    phoneValid: true,
    interests: ['Pediatria', 'Alergologia'],
    status: 'Em fila',
    lastNotificationDate: '17 Jun, 2024',
    lastNotificationStatus: 'Enviada',
    lastConfirmationDate: '',
    lastConfirmationSpecialty: '',
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
  },
];

export const getPatientSpecialtyOptions = (
  existingPatients = [],
  selectedInterests = [],
) => {
  const specialtyOptions = new Set(basePatientSpecialtyOptions);

  existingPatients.forEach((patient) => {
    splitPatientInterests(patient?.interests).forEach((interest) => {
      specialtyOptions.add(interest);
    });
  });

  splitPatientInterests(selectedInterests).forEach((interest) => {
    specialtyOptions.add(interest);
  });

  return [...specialtyOptions].sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, 'pt-BR'),
  );
};

export const getPatientFormInitialValues = (patient = null) => ({
  name: patient?.name ?? '',
  cpf: patient?.cpf ?? '',
  phone: patient?.phone ?? '',
  email: patient?.email ?? '',
  interests: splitPatientInterests(patient?.interests),
  status: patient?.status ?? 'Em fila',
});

const buildPatientFieldsFromForm = (formValues) => {
  const formattedCpf = formatCpf(formValues.cpf);
  const formattedPhone = formatPhone(formValues.phone);
  const name = formValues.name.trim();
  const interests = splitPatientInterests(formValues.interests);

  return {
    name,
    cpf: formattedCpf,
    phone: formattedPhone,
    email: formValues.email.trim().toLowerCase(),
    phoneValid: isPhoneValid(formValues.phone),
    interests,
    status: formValues.status,
  };
};

export const buildPatientFromForm = (formValues, existingPatients = []) => {
  const nextId = existingPatients.reduce(
    (highestId, patient) => Math.max(highestId, Number(patient.id) || 0),
    0,
  ) + 1;
  const patientFields = buildPatientFieldsFromForm(formValues);

  return {
    id: nextId,
    ...patientFields,
    lastNotificationDate: 'Sem envio',
    lastNotificationStatus: 'Sem envio',
    lastConfirmationDate: '',
    lastConfirmationSpecialty: '',
    avatar: createPatientAvatar(patientFields.name),
    createdAt: new Date().toISOString(),
  };
};

export const buildUpdatedPatientFromForm = (formValues, currentPatient) => {
  const patientFields = buildPatientFieldsFromForm(formValues);
  const shouldRefreshAvatar =
    !currentPatient.avatar || currentPatient.avatar.startsWith('data:image/svg+xml');
  const phoneDidChange = currentPatient.phone !== patientFields.phone;

  return {
    ...currentPatient,
    ...patientFields,
    phoneValid: phoneDidChange ? patientFields.phoneValid : currentPatient.phoneValid,
    avatar: shouldRefreshAvatar
      ? createPatientAvatar(patientFields.name)
      : currentPatient.avatar,
  };
};
