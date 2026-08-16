export interface IAuthenticationRequest {
  email: string;
  password: string;
}

export interface IPasswordResetRequest {
  email: string;
}

export interface IPasswordResetConfirm {
  email: string;
  token: string;
  password: string;
}

export interface IMessageResponse {
  message: string;
  /** Disponível no ambiente atual para permitir teste sem provedor de e-mail. */
  token?: string;
}
