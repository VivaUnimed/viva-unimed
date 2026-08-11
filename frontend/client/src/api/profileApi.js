import {
  getRequest,
  patchRequest,
} from './api';

/**
 * Converte:
 * 2000-05-20
 * ou
 * 2000-05-20T12:00:00.000Z
 *
 * Para:
 * 20/05/2000
 */
const formatBirthFromApi = (birth) => {
  if (!birth) {
    return '';
  }

  const datePart = String(birth).split('T')[0];
  const [year, month, day] = datePart.split('-');

  if (!year || !month || !day) {
    return '';
  }

  return `${day}/${month}/${year}`;
};

/**
 * Converte:
 * 20/05/2000
 *
 * Para:
 * 2000-05-20
 */
const formatBirthToApi = (birthDate) => {
  if (!birthDate) {
    return undefined;
  }

  /*
   * Caso a data já esteja no formato
   * aceito pelo backend.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return birthDate;
  }

  const [day, month, year] =
    String(birthDate).split('/');

  if (!day || !month || !year) {
    return undefined;
  }

  return `${year}-${month}-${day}`;
};

const formatCpf = (value) => {
  const numbers = String(value ?? '').replace(/\D/g, '');

  if (numbers.length !== 11) {
    return numbers;
  }

  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4',
  );
};

/**
 * Converte os dados retornados pelo backend
 * para o formato utilizado pela tela de perfil.
 */
const normalizeProfile = (
  response = {},
  currentProfile = {},
) => {
  const patient =
    response?.data ??
    response ??
    {};

  return {
    /*
     * id e patientId representam o registro
     * da tabela patients.
     */
    id:
      patient.patientId ??
      patient.id ??
      currentProfile.id ??
      null,

    patientId:
      patient.patientId ??
      patient.id ??
      currentProfile.patientId ??
      null,

    /*
     * userId representa o registro
     * correspondente na tabela users.
     */
    userId:
      patient.userId ??
      currentProfile.userId ??
      null,

    name:
      patient.name ??
      currentProfile.name ??
      '',

    email:
      patient.email ??
      currentProfile.email ??
      '',

    phone:
      patient.phone !== undefined &&
      patient.phone !== null
        ? String(patient.phone)
        : String(currentProfile.phone ?? ''),

    cpf: formatCpf(
        patient.cpf ??
        currentProfile.cpf ??
        '',
      ),

    birthDate:
      formatBirthFromApi(patient.birth) ||
      currentProfile.birthDate ||
      '',

    roles:
      patient.roles ??
      currentProfile.roles ??
      [],

    permissions:
      patient.permissions ??
      currentProfile.permissions ??
      [],
  };
};

/**
 * Carrega o perfil completo do paciente
 * autenticado pelo JWT.
 */
export const getProfile = async () => {
  try {
    const patient = await getRequest(
      '/api/patient/me',
    );

    console.log(
      'Perfil do paciente carregado:',
      patient,
    );

    return normalizeProfile(patient);
  } catch (error) {
    console.error(
      'Erro ao carregar perfil:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível carregar os dados do perfil.',
    );
  }
};

/**
 * Atualiza o próprio perfil do paciente.
 *
 * O backend permite atualizar:
 * - name
 * - email
 * - phone
 * - birth
 *
 * O CPF não é enviado porque a nova rota
 * não permite sua alteração.
 */
export const updateProfile = async (
  profileData,
) => {
  try {
    const phoneNumbers = String(
      profileData.phone ?? '',
    ).replace(/\D/g, '');

    const payload = {
      name:
        profileData.name?.trim() ||
        undefined,

      email:
        profileData.email?.trim() ||
        undefined,

      /*
       * Envia somente os números do telefone.
       * Exemplo:
       * (51) 99999-0004
       * vira:
       * 51999990004
       */
      phone:
        phoneNumbers ||
        undefined,

      birth: formatBirthToApi(
        profileData.birthDate,
      ),
    };

    console.log(
      'Atualizando perfil do paciente:',
      payload,
    );

    const updatedPatient = await patchRequest(
      '/api/patient/me',
      payload,
    );

    console.log(
      'Perfil atualizado:',
      updatedPatient,
    );

    return normalizeProfile(
      updatedPatient,
      profileData,
    );
  } catch (error) {
    console.error(
      'Erro ao atualizar perfil:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível atualizar os dados do perfil.',
    );
  }
};

