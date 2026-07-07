export const patientInitialState = {
  patients: [
    {
      id: 1,
      userId: 101,
      birth: '1998-05-10T00:00:00.000Z',
      createdAt: '2026-07-01T10:30:00.000Z',
      updatedAt: '2026-07-01T10:30:00.000Z',
    },
    {
      id: 2,
      userId: 102,
      birth: '1987-11-22T00:00:00.000Z',
      createdAt: '2026-07-02T14:15:00.000Z',
      updatedAt: '2026-07-02T14:15:00.000Z',
    },
    {
      id: 3,
      userId: 103,
      birth: '2001-03-08T00:00:00.000Z',
      createdAt: '2026-07-03T09:45:00.000Z',
      updatedAt: '2026-07-03T09:45:00.000Z',
    },
  ],

  users: [
    {
      id: 101,
      name: 'Mariana Silva',
      email: 'mariana.silva@email.com',
      phone: 53999998888,
      cpf: '12345678901',
      roles: ['Paciente'],
      permissions: [],
    },
    {
      id: 102,
      name: 'João Pereira',
      email: 'joao.pereira@email.com',
      phone: 53988887777,
      cpf: '98765432100',
      roles: ['Paciente'],
      permissions: [],
    },
    {
      id: 103,
      name: 'Camila Rodrigues',
      email: 'camila.rodrigues@email.com',
      phone: 53977776666,
      cpf: '45678912300',
      roles: ['Paciente'],
      permissions: [],
    },
  ],

  adminPatients: [
    {
      id: 1,
      patientId: 1,
      userId: 101,
      birth: '1998-05-10T00:00:00.000Z',
      createdAt: '2026-07-01T10:30:00.000Z',
      updatedAt: '2026-07-01T10:30:00.000Z',

      name: 'Mariana Silva',
      email: 'mariana.silva@email.com',
      phone: 53999998888,
      cpf: '12345678901',

      user: {
        id: 101,
        name: 'Mariana Silva',
        email: 'mariana.silva@email.com',
        phone: 53999998888,
        cpf: '12345678901',
        roles: ['Paciente'],
        permissions: [],
      },

      patient: {
        id: 1,
        userId: 101,
        birth: '1998-05-10T00:00:00.000Z',
        createdAt: '2026-07-01T10:30:00.000Z',
        updatedAt: '2026-07-01T10:30:00.000Z',
      },
    },
    {
      id: 2,
      patientId: 2,
      userId: 102,
      birth: '1987-11-22T00:00:00.000Z',
      createdAt: '2026-07-02T14:15:00.000Z',
      updatedAt: '2026-07-02T14:15:00.000Z',

      name: 'João Pereira',
      email: 'joao.pereira@email.com',
      phone: 53988887777,
      cpf: '98765432100',

      user: {
        id: 102,
        name: 'João Pereira',
        email: 'joao.pereira@email.com',
        phone: 53988887777,
        cpf: '98765432100',
        roles: ['Paciente'],
        permissions: [],
      },

      patient: {
        id: 2,
        userId: 102,
        birth: '1987-11-22T00:00:00.000Z',
        createdAt: '2026-07-02T14:15:00.000Z',
        updatedAt: '2026-07-02T14:15:00.000Z',
      },
    },
    {
      id: 3,
      patientId: 3,
      userId: 103,
      birth: '2001-03-08T00:00:00.000Z',
      createdAt: '2026-07-03T09:45:00.000Z',
      updatedAt: '2026-07-03T09:45:00.000Z',

      name: 'Camila Rodrigues',
      email: 'camila.rodrigues@email.com',
      phone: 53977776666,
      cpf: '45678912300',

      user: {
        id: 103,
        name: 'Camila Rodrigues',
        email: 'camila.rodrigues@email.com',
        phone: 53977776666,
        cpf: '45678912300',
        roles: ['Paciente'],
        permissions: [],
      },

      patient: {
        id: 3,
        userId: 103,
        birth: '2001-03-08T00:00:00.000Z',
        createdAt: '2026-07-03T09:45:00.000Z',
        updatedAt: '2026-07-03T09:45:00.000Z',
      },
    },
  ],

  isLoading: false,
  error: null,
};