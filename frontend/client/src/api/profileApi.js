import { getRequest, putRequest } from './api';

/**
 * Converte os dados da tabela users para o formato
 * utilizado pela página de perfil.
 */
const normalizeProfile = (user = {}, currentProfile = {}) => ({
  // Neste fluxo, id e userId são o ID da tabela users.
  id: user.id ?? currentProfile.id ?? null,
  userId: user.id ?? currentProfile.userId ?? null,

  name: user.name ?? currentProfile.name ?? '',
  email: user.email ?? currentProfile.email ?? '',
  phone: user.phone
    ? String(user.phone)
    : String(currentProfile.phone ?? ''),
  cpf: user.cpf
    ? String(user.cpf)
    : String(currentProfile.cpf ?? ''),

  /*
   * A data não está na tabela users.
   * Mantemos o valor atual para não apagá-lo no estado da tela.
   */
  birthDate: currentProfile.birthDate ?? '',
});

/**
 * Carrega os dados do usuário autenticado.
 */
export const getProfile = async () => {
  try {
    const user = await getRequest('/api/user/me');

    console.log('Usuário carregado:', user);

    return normalizeProfile(user);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);

    throw new Error(
      error?.message ||
        'Não foi possível carregar os dados do perfil.',
    );
  }
};

/**
 * Atualiza nome, e-mail, telefone e CPF.
 */
export const updateProfile = async (profileData) => {
  try {
    const userId = profileData.userId ?? profileData.id;

    if (!userId) {
      throw new Error('ID do usuário não encontrado.');
    }

    const phoneNumbers = String(
      profileData.phone ?? '',
    ).replace(/\D/g, '');

    const cpfNumbers = String(
      profileData.cpf ?? '',
    ).replace(/\D/g, '');

    const payload = {
      name: profileData.name?.trim(),
      email: profileData.email?.trim(),

      /*
       * O backend trabalha com telefone numérico.
       * Exemplo: (51) 99999-0004 -> 51999990004
       */
      phone: phoneNumbers
        ? Number(phoneNumbers)
        : undefined,

      /*
       * O CPF é enviado sem pontos e traço.
       */
      cpf: cpfNumbers || undefined,
    };

    console.log('Atualizando usuário:', {
      userId,
      payload,
    });

    const updatedUser = await putRequest(
      `/api/user/${userId}`,
      payload,
    );

    return normalizeProfile(updatedUser, profileData);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    throw new Error(
      error?.message ||
        'Não foi possível atualizar os dados do perfil.',
    );
  }
};