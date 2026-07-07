export const buildAdminPatients = (patients = [], users = []) => {
  const usersById = new Map(users.map((user) => [String(user.id), user]));

  return patients.map((patient) => {
    const user = usersById.get(String(patient.userId));

    return {
      id: patient.id,
      patientId: patient.id,
      userId: patient.userId,

      birth: patient.birth,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,

      name: user?.name ?? 'Usuário não encontrado',
      email: user?.email ?? '-',
      phone: user?.phone ?? '-',
      cpf: user?.cpf ?? '-',

      user,
      patient,
    };
  });
};
