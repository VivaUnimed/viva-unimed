const avatarPalettes = [
  { background: '#d8f3e8', foreground: '#0f6b47' },
  { background: '#e0f2fe', foreground: '#0f4c81' },
  { background: '#fef3c7', foreground: '#92400e' },
  { background: '#fce7f3', foreground: '#9d174d' },
];

const defaultWeekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

const pickAvatarPalette = (name = '') => {
  const total = name
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

  return avatarPalettes[total % avatarPalettes.length];
};

const getProfessionalInitials = (name = '') => {
  const [firstName = '', secondName = ''] = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return `${firstName[0] || ''}${secondName[0] || firstName[1] || ''}`.toUpperCase();
};

const getNormalizedSchedule = (schedule = {}) => ({
  days:
    Array.isArray(schedule.days) && schedule.days.length > 0
      ? schedule.days
      : defaultWeekDays,
  morning: {
    start: schedule.morning?.start ?? '08:00',
    end: schedule.morning?.end ?? '12:00',
  },
  afternoon: {
    start: schedule.afternoon?.start ?? '13:30',
    end: schedule.afternoon?.end ?? '18:00',
  },
});

const normalizeProfessionalRecord = (professional = {}) => ({
  ...professional,
  name: professional.name ?? '',
  email: professional.email ?? '',
  phone: professional.phone ?? '',
  crm: String(professional.crm ?? '').trim(),
  uf: professional.uf ?? 'RS',
  weeklyHours:
    professional.weeklyHours === null || professional.weeklyHours === undefined
      ? null
      : Number(professional.weeklyHours),
  specialties: Array.isArray(professional.specialties)
    ? professional.specialties.filter(Boolean)
    : [],
  unit: professional.unit ?? '',
  status: professional.status ?? 'Ativo',
  avatar:
    professional.avatar || createProfessionalAvatar(professional.name ?? 'Profissional'),
  profilePhotoName: professional.profilePhotoName ?? null,
  schedule: getNormalizedSchedule(professional.schedule),
});

const getDefaultProfessionalsSnapshot = () =>
  defaultProfessionals.map((professional) =>
    normalizeProfessionalRecord(professional),
  );

const buildProfessionalFieldsFromForm = (formValues) => ({
  name: formValues.name.trim(),
  email: formValues.email.trim().toLowerCase(),
  phone: formValues.phone.trim(),
  crm: formValues.crm.trim(),
  uf: formValues.uf,
  weeklyHours: formValues.weeklyHours ? Number(formValues.weeklyHours) : null,
  specialties: Array.isArray(formValues.specialties)
    ? formValues.specialties.filter(Boolean)
    : [],
  unit: formValues.unit,
  status: formValues.status,
  profilePhotoName: formValues.profilePhotoName || null,
  schedule: getNormalizedSchedule(formValues.schedule),
});

export const normalizeText = (value = '') =>
  value
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

export const professionalSpecialtyOptions = [
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Clínica Médica',
  'Nutrologia',
  'Neurologia',
];

export const professionalUnitOptions = [
  'Unidade Centro',
  'Unidade Cassino',
  'Unidade São Pedro',
];

export const professionalUfOptions = ['RS', 'SC', 'PR'];
export const professionalWeekDayOptions = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const defaultProfessionals = [
  {
    id: 1,
    name: 'Dra. Beatriz Santos',
    email: 'beatriz.santos@unimed.com',
    phone: '(53) 99999-0101',
    specialties: ['Ginecologia', 'Obstetrícia'],
    crm: '12345',
    uf: 'RS',
    weeklyHours: 40,
    unit: 'Unidade Centro',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    profilePhotoName: 'beatriz-santos.jpg',
    schedule: {
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      morning: { start: '08:00', end: '12:00' },
      afternoon: { start: '13:30', end: '18:00' },
    },
  },
  {
    id: 2,
    name: 'Dr. Ricardo Oliveira',
    email: 'ricardo.o@unimed.com',
    phone: '(53) 98888-2244',
    specialties: ['Ortopedia', 'Clínica Médica'],
    crm: '54321',
    uf: 'RS',
    weeklyHours: 36,
    unit: 'Unidade Cassino',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&crop=face',
    profilePhotoName: 'ricardo-oliveira.jpg',
    schedule: {
      days: ['Seg', 'Qua', 'Sex'],
      morning: { start: '07:30', end: '12:00' },
      afternoon: { start: '13:00', end: '17:30' },
    },
  },
  {
    id: 3,
    name: 'Dra. Mariana Lima',
    email: 'm.lima@unimed.com',
    phone: '(53) 99777-3322',
    specialties: ['Clínica Médica', 'Cardiologia', 'Pediatria'],
    crm: '98765',
    uf: 'RS',
    weeklyHours: 20,
    unit: 'Unidade São Pedro',
    status: 'Inativo',
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
    profilePhotoName: 'mariana-lima.jpg',
    schedule: {
      days: ['Ter', 'Qui'],
      morning: { start: '08:30', end: '11:30' },
      afternoon: { start: '14:00', end: '18:00' },
    },
  },
  {
    id: 4,
    name: 'Dr. Felipe Arantes',
    email: 'f.arantes@unimed.com',
    phone: '(53) 99666-4455',
    specialties: ['Cardiologia', 'Dermatologia', 'Clínica Médica'],
    crm: '67899',
    uf: 'RS',
    weeklyHours: 44,
    unit: 'Unidade Centro',
    status: 'Ativo',
    avatar:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face',
    profilePhotoName: 'felipe-arantes.jpg',
    schedule: {
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      morning: { start: '09:00', end: '12:30' },
      afternoon: { start: '14:00', end: '18:30' },
    },
  },
];

let mockProfessionals = getDefaultProfessionalsSnapshot();

export const getStoredProfessionals = () => {
  return mockProfessionals.map((professional) =>
    normalizeProfessionalRecord(professional),
  );
};

export const saveStoredProfessionals = (professionals = []) => {
  mockProfessionals = professionals.map((professional) =>
    normalizeProfessionalRecord(professional),
  );

  return getStoredProfessionals();
};

export const formatProfessionalRegistration = (professional = {}) => {
  const crm = String(professional.crm ?? '').trim();
  const uf = professional.uf?.trim() || 'RS';

  if (!crm) {
    return `CRM-${uf}`;
  }

  return `CRM-${uf} ${crm}`;
};

export const getProfessionalSpecialtyOptions = (
  existingProfessionals = [],
  selectedSpecialties = [],
) => {
  const specialtyOptions = new Set(professionalSpecialtyOptions);

  existingProfessionals.forEach((professional) => {
    (professional.specialties ?? []).forEach((specialty) => {
      specialtyOptions.add(specialty);
    });
  });

  (selectedSpecialties ?? []).forEach((specialty) => {
    specialtyOptions.add(specialty);
  });

  return [...specialtyOptions].sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, 'pt-BR'),
  );
};

export const getProfessionalUnitOptions = (existingProfessionals = []) => {
  const unitOptions = new Set(professionalUnitOptions);

  existingProfessionals.forEach((professional) => {
    if (professional.unit) {
      unitOptions.add(professional.unit);
    }
  });

  return [...unitOptions].sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, 'pt-BR'),
  );
};

export const getProfessionalFormInitialValues = (professional = null) => ({
  name: professional?.name ?? '',
  email: professional?.email ?? '',
  phone: professional?.phone ?? '',
  crm: String(professional?.crm ?? ''),
  uf: professional?.uf ?? 'RS',
  weeklyHours:
    professional?.weeklyHours === null || professional?.weeklyHours === undefined
      ? ''
      : String(professional.weeklyHours),
  unit: professional?.unit ?? '',
  profilePhotoName: professional?.profilePhotoName ?? '',
  status: professional?.status ?? 'Ativo',
  specialties: Array.isArray(professional?.specialties)
    ? professional.specialties
    : [],
  schedule: getNormalizedSchedule(professional?.schedule),
});

export const buildProfessionalFromForm = (formValues, existingProfessionals = []) => {
  const nextId =
    existingProfessionals.reduce(
      (highestId, professional) => Math.max(highestId, Number(professional.id) || 0),
      0,
    ) + 1;
  const professionalFields = buildProfessionalFieldsFromForm(formValues);

  return {
    id: nextId,
    ...professionalFields,
    avatar: createProfessionalAvatar(professionalFields.name),
    createdAt: new Date().toISOString(),
  };
};

export const buildUpdatedProfessionalFromForm = (
  formValues,
  currentProfessional,
) => {
  const professionalFields = buildProfessionalFieldsFromForm(formValues);
  const shouldRefreshAvatar =
    !currentProfessional.avatar ||
    currentProfessional.avatar.startsWith('data:image/svg+xml');

  return {
    ...currentProfessional,
    ...professionalFields,
    avatar: shouldRefreshAvatar
      ? createProfessionalAvatar(professionalFields.name)
      : currentProfessional.avatar,
  };
};

export const createMockProfessional = (formValues) => {
  const professionals = getStoredProfessionals();
  const professional = buildProfessionalFromForm(formValues, professionals);

  saveStoredProfessionals([...professionals, professional]);

  return professional;
};

export const updateMockProfessional = (professionalId, formValues) => {
  const professionals = getStoredProfessionals();
  const currentProfessional = professionals.find(
    (professional) => String(professional.id) === String(professionalId),
  );

  if (!currentProfessional) {
    return null;
  }

  const updatedProfessional = buildUpdatedProfessionalFromForm(
    formValues,
    currentProfessional,
  );

  saveStoredProfessionals(
    professionals.map((professional) =>
      String(professional.id) === String(professionalId)
        ? updatedProfessional
        : professional,
    ),
  );

  return updatedProfessional;
};

export const toggleMockProfessionalStatus = (professionalId) => {
  const professionals = getStoredProfessionals();
  const currentProfessional = professionals.find(
    (professional) => String(professional.id) === String(professionalId),
  );

  if (!currentProfessional) {
    return null;
  }

  const updatedProfessional = {
    ...currentProfessional,
    status: currentProfessional.status === 'Ativo' ? 'Inativo' : 'Ativo',
  };

  saveStoredProfessionals(
    professionals.map((professional) =>
      String(professional.id) === String(professionalId)
        ? updatedProfessional
        : professional,
    ),
  );

  return updatedProfessional;
};
