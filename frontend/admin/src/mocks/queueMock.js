export const queuePatientsMock = [
  {
    id: 1,
    name: 'Maria Silva',
    cpf: '41728593014',
    phone: '53999887766',
    email: 'maria.silva@teste.local',
  },
  {
    id: 2,
    name: 'João Martins',
    cpf: '14697285041',
    phone: '47992831746',
    email: 'joao.martins@teste.local',
  },
  {
    id: 3,
    name: 'Ana Paula Costa',
    cpf: '48937054448',
    phone: '51999881122',
    email: 'ana.costa@teste.local',
  },
  {
    id: 4,
    name: 'Carlos Eduardo Lima',
    cpf: '36819542002',
    phone: '11988776655',
    email: 'carlos.lima@teste.local',
  },
  {
    id: 5,
    name: 'Fernanda Rocha',
    cpf: '90327165073',
    phone: '31999885544',
    email: 'fernanda.rocha@teste.local',
  },
  {
    id: 6,
    name: 'Beatriz Souza',
    cpf: '82564139080',
    phone: '21991234567',
    email: 'beatriz.souza@teste.local',
  },
  {
    id: 7,
    name: 'Ricardo Alves',
    cpf: '74268195006',
    phone: '41996543210',
    email: 'ricardo.alves@teste.local',
  },
  {
    id: 8,
    name: 'Luciana Freitas',
    cpf: '20573841009',
    phone: '71993456789',
    email: 'luciana.freitas@teste.local',
  },
];

export const queueSpecialtiesMock = [
  { id: 1, name: 'Pediatria' },
  { id: 2, name: 'Cardiologia' },
  { id: 3, name: 'Dermatologia' },
  { id: 4, name: 'Ginecologia' },
  { id: 5, name: 'Ortopedia' },
];

export const queueProfessionalsMock = [
  {
    id: 1,
    name: 'Dra. Helena Duarte',
    specialityIds: [1],
    crm: '12345-RS',
  },
  {
    id: 2,
    name: 'Dr. João Pereira',
    specialityIds: [1, 5],
    crm: '52108-SC',
  },
  {
    id: 3,
    name: 'Dra. Ana Costa',
    specialityIds: [2],
    crm: '88214-PR',
  },
  {
    id: 4,
    name: 'Dra. Beatriz Lima',
    specialityIds: [3],
    crm: '44129-RJ',
  },
  {
    id: 5,
    name: 'Dr. Ricardo Nunes',
    specialityIds: [5],
    crm: '78211-SP',
  },
  {
    id: 6,
    name: 'Dra. Laura Martins',
    specialityIds: [4],
    crm: '33419-MG',
  },
];

export const queueVacanciesMock = [
  {
    id: 1,
    date: '2026-07-17T09:00:00',
    doctorId: 1,
    specialityId: 1,
    status: 'open',
  },
  {
    id: 2,
    date: '2026-07-18T15:30:00',
    doctorId: 2,
    specialityId: 1,
    status: 'open',
  },
  {
    id: 3,
    date: '2026-07-19T10:00:00',
    doctorId: 3,
    specialityId: 2,
    status: 'open',
  },
  {
    id: 4,
    date: '2026-07-20T13:45:00',
    doctorId: 4,
    specialityId: 3,
    status: 'booked',
  },
  {
    id: 5,
    date: '2026-07-21T08:15:00',
    doctorId: 6,
    specialityId: 4,
    status: 'open',
  },
  {
    id: 6,
    date: '2026-07-22T11:20:00',
    doctorId: 5,
    specialityId: 5,
    status: 'cancelled',
  },
  {
    id: 7,
    date: '2026-07-23T16:00:00',
    doctorId: 5,
    specialityId: 5,
    status: 'open',
  },
];

export const queueRequestsMock = [
  {
    id: 1,
    patientId: 1,
    specialityId: 1,
    doctorId: 1,
    status: 'waiting',
    createdAt: '2026-07-15T09:30:00',
    updatedAt: '2026-07-15T09:30:00',
  },
  {
    id: 2,
    patientId: 2,
    specialityId: 2,
    doctorId: null,
    status: 'waiting',
    createdAt: '2026-07-14T14:10:00',
    updatedAt: '2026-07-14T14:10:00',
  },
  {
    id: 3,
    patientId: 3,
    specialityId: 5,
    doctorId: null,
    status: 'waiting',
    createdAt: '2026-07-13T11:45:00',
    updatedAt: '2026-07-13T11:45:00',
  },
  {
    id: 4,
    patientId: 4,
    specialityId: 3,
    doctorId: 4,
    status: 'waiting',
    createdAt: '2026-07-12T16:00:00',
    updatedAt: '2026-07-12T16:00:00',
  },
  {
    id: 5,
    patientId: 5,
    specialityId: 4,
    doctorId: 6,
    status: 'approved',
    createdAt: '2026-07-11T10:20:00',
    updatedAt: '2026-07-15T18:00:00',
  },
  {
    id: 6,
    patientId: 6,
    specialityId: 1,
    doctorId: null,
    status: 'cancelled',
    createdAt: '2026-07-10T08:50:00',
    updatedAt: '2026-07-13T13:35:00',
  },
  {
    id: 7,
    patientId: 7,
    specialityId: 4,
    doctorId: null,
    status: 'expired',
    createdAt: '2026-07-09T15:40:00',
    updatedAt: '2026-07-12T09:00:00',
  },
  {
    id: 8,
    patientId: 8,
    specialityId: 1,
    doctorId: 2,
    status: 'rejected',
    createdAt: '2026-07-08T17:15:00',
    updatedAt: '2026-07-10T10:25:00',
  },
];

export const createInitialQueueRequests = () => (
  queueRequestsMock.map((request) => ({ ...request }))
);
