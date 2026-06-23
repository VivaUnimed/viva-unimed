const VACANCIES_STORAGE_KEY = 'viva-unimed-admin-vacancies';
const VACANCIES_STORAGE_VERSION = 1;

const generatedVacancies = [
  {
    id: 1,
    time: '14:30',
    date: 'Hoje, 24 Out',
    specialty: 'Cardiologia',
    professional: 'Dr. Ricardo Almeida',
    queuePatients: 12,
    vacancyStatus: 'waiting-acceptance',
    vacancyStatusText: 'Aguardando aceite',
    dispatchStatus: 'success',
    dispatchStatusText: 'Enviado com sucesso',
    expiration: 'Expira em 08 min',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: '',
    history: [
      {
        id: '1-created',
        title: 'Vaga cadastrada',
        description: 'Disponibilidade registrada e enviada para a fila inteligente.',
        timestamp: 'Hoje, 14:20',
      },
      {
        id: '1-dispatch',
        title: 'Disparo concluído',
        description: 'Pacientes elegíveis foram notificados automaticamente.',
        timestamp: 'Hoje, 14:21',
      },
      {
        id: '1-waiting',
        title: 'Aguardando aceite',
        description: 'A vaga segue ativa até o limite de expiração configurado.',
        timestamp: 'Hoje, 14:22',
      },
    ],
  },
  {
    id: 2,
    time: '15:15',
    date: 'Hoje, 24 Out',
    specialty: 'Pediatria',
    professional: 'Dr. Fábio Mello',
    queuePatients: 9,
    vacancyStatus: 'open',
    vacancyStatusText: 'Aberta',
    dispatchStatus: 'error',
    dispatchStatusText: 'Falha no disparo',
    expiration: 'Falha antes do aceite',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: '',
    history: [
      {
        id: '2-created',
        title: 'Vaga cadastrada',
        description: 'A unidade abriu a vaga para a fila de Pediatria.',
        timestamp: 'Hoje, 15:00',
      },
      {
        id: '2-error',
        title: 'Falha no disparo',
        description: 'O envio automático não chegou aos pacientes elegíveis.',
        timestamp: 'Hoje, 15:01',
      },
    ],
  },
  {
    id: 3,
    time: '16:45',
    date: 'Hoje, 24 Out',
    specialty: 'Dermatologia',
    professional: 'Dra. Cláudia Lima',
    queuePatients: 0,
    vacancyStatus: 'open',
    vacancyStatusText: 'Aberta',
    dispatchStatus: 'error',
    dispatchStatusText: 'Falha no disparo',
    expiration: 'Falha antes do aceite',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: '',
    history: [
      {
        id: '3-created',
        title: 'Vaga cadastrada',
        description: 'A disponibilidade foi registrada para Dermatologia.',
        timestamp: 'Hoje, 16:31',
      },
      {
        id: '3-no-queue',
        title: 'Fila sem elegíveis',
        description: 'Nenhum paciente com interesse ativo foi encontrado.',
        timestamp: 'Hoje, 16:32',
      },
    ],
  },
  {
    id: 4,
    time: '09:00',
    date: 'Amanhã, 25 Out',
    specialty: 'Endocrinologia',
    professional: 'Dr. Rafael Tavares',
    queuePatients: 6,
    vacancyStatus: 'open',
    vacancyStatusText: 'Aberta',
    dispatchStatus: 'error',
    dispatchStatusText: 'Falha no disparo',
    expiration: 'Falha antes do aceite',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: '',
    history: [
      {
        id: '4-created',
        title: 'Vaga cadastrada',
        description: 'Oferta liberada para pacientes em Endocrinologia.',
        timestamp: 'Hoje, 18:05',
      },
      {
        id: '4-error',
        title: 'Falha no disparo',
        description: 'A notificação automática não foi concluída.',
        timestamp: 'Hoje, 18:06',
      },
    ],
  },
  {
    id: 5,
    time: '11:20',
    date: 'Amanhã, 25 Out',
    specialty: 'Ginecologia',
    professional: 'Dra. Marina Costa',
    queuePatients: 18,
    vacancyStatus: 'confirmed',
    vacancyStatusText: 'Confirmada',
    dispatchStatus: 'success',
    dispatchStatusText: 'Enviado com sucesso',
    expiration: 'Finalizada',
    confirmedPatient: 'Ana Souza',
    acceptanceTimestamp: 'Amanhã, 25 Out às 10:58',
    finalDescription: '',
    history: [
      {
        id: '5-created',
        title: 'Vaga cadastrada',
        description: 'A vaga foi criada pela unidade e entrou na fila inteligente.',
        timestamp: 'Hoje, 17:42',
      },
      {
        id: '5-dispatch',
        title: 'Disparo concluído',
        description: 'Pacientes elegíveis receberam a oferta da vaga.',
        timestamp: 'Hoje, 17:43',
      },
      {
        id: '5-confirmed',
        title: 'Paciente confirmou',
        description: 'Ana Souza aceitou a oferta dentro do prazo.',
        timestamp: 'Amanhã, 25 Out às 10:58',
      },
    ],
  },
  {
    id: 6,
    time: '13:10',
    date: 'Amanhã, 25 Out',
    specialty: 'Neurologia',
    professional: 'Dra. Isabela Moura',
    queuePatients: 14,
    vacancyStatus: 'expired',
    vacancyStatusText: 'Expirada',
    dispatchStatus: 'success',
    dispatchStatusText: 'Enviado com sucesso',
    expiration: 'Expirou há 12 min',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: 'Nenhum paciente aceitou dentro do prazo.',
    history: [
      {
        id: '6-created',
        title: 'Vaga cadastrada',
        description: 'Oferta enviada para pacientes da fila de Neurologia.',
        timestamp: 'Amanhã, 25 Out às 12:35',
      },
      {
        id: '6-dispatch',
        title: 'Disparo enviado',
        description: 'A notificação foi entregue para os pacientes elegíveis.',
        timestamp: 'Amanhã, 25 Out às 12:36',
      },
      {
        id: '6-expired',
        title: 'Prazo encerrado',
        description: 'Nenhum aceite foi registrado antes da expiração.',
        timestamp: 'Amanhã, 25 Out às 12:58',
      },
    ],
  },
  {
    id: 7,
    time: '15:40',
    date: 'Amanhã, 25 Out',
    specialty: 'Otorrinolaringologia',
    professional: 'Dr. Gustavo Nunes',
    queuePatients: 4,
    vacancyStatus: 'cancelled',
    vacancyStatusText: 'Cancelada',
    dispatchStatus: 'success',
    dispatchStatusText: 'Enviado com sucesso',
    expiration: 'Cancelada pela unidade',
    confirmedPatient: null,
    acceptanceTimestamp: null,
    finalDescription: 'Vaga cancelada pela unidade.',
    history: [
      {
        id: '7-created',
        title: 'Vaga cadastrada',
        description: 'Horário aberto e colocado na fila inteligente.',
        timestamp: 'Amanhã, 25 Out às 14:50',
      },
      {
        id: '7-dispatch',
        title: 'Disparo concluído',
        description: 'Pacientes elegíveis foram notificados com sucesso.',
        timestamp: 'Amanhã, 25 Out às 14:51',
      },
      {
        id: '7-cancelled',
        title: 'Vaga cancelada',
        description: 'A unidade removeu a disponibilidade antes do aceite.',
        timestamp: 'Amanhã, 25 Out às 15:10',
      },
    ],
  },
];

function cloneVacancies(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getGeneratedVacancies() {
  return cloneVacancies(generatedVacancies);
}

export function loadVacancies() {
  if (typeof window === 'undefined') {
    return getGeneratedVacancies();
  }

  try {
    const rawValue = window.localStorage.getItem(VACANCIES_STORAGE_KEY);

    if (!rawValue) {
      return getGeneratedVacancies();
    }

    const parsedValue = JSON.parse(rawValue);

    if (
      parsedValue?.version === VACANCIES_STORAGE_VERSION
      && Array.isArray(parsedValue.slots)
    ) {
      return cloneVacancies(parsedValue.slots);
    }
  } catch (error) {
    return getGeneratedVacancies();
  }

  return getGeneratedVacancies();
}

export function persistVacancies(slots) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      VACANCIES_STORAGE_KEY,
      JSON.stringify({
        version: VACANCIES_STORAGE_VERSION,
        slots,
      }),
    );
    window.dispatchEvent(new Event('vacancies-updated'));
  } catch (error) {
    // Mantem a tela funcional mesmo se o storage estiver indisponivel.
  }
}

export function findVacancyById(vacancyId) {
  return loadVacancies().find(
    (vacancy) => String(vacancy.id) === String(vacancyId),
  );
}

export function getVacancyFinalDescription(vacancy) {
  if (vacancy.vacancyStatus === 'expired') {
    return 'Nenhum paciente aceitou dentro do prazo.';
  }

  if (vacancy.vacancyStatus === 'cancelled') {
    return 'Vaga cancelada pela unidade.';
  }

  return vacancy.finalDescription || '';
}

export function getSlotAction(slot) {
  if (slot.vacancyStatus === 'confirmed') {
    return {
      label: 'Ver confirmação',
      variant: 'secondary',
    };
  }

  if (slot.vacancyStatus === 'expired' || slot.vacancyStatus === 'cancelled') {
    return {
      label: 'Detalhes',
      variant: 'secondary',
    };
  }

  if (slot.dispatchStatus === 'error') {
    return slot.queuePatients > 0
      ? {
          label: 'Tentar novamente',
          variant: 'primary',
        }
      : {
          label: 'Ver fila',
          variant: 'secondary',
        };
  }

  if (slot.vacancyStatus === 'waiting-acceptance' && slot.dispatchStatus === 'success') {
    return {
      label: 'Gerenciar',
      variant: 'primary',
    };
  }

  return {
    label: 'Detalhes',
    variant: 'secondary',
  };
}
