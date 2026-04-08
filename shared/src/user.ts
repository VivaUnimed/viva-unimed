export interface IUserCreate {
  name: string;
  email: string;
  password?: string;
}

export interface IUserUpdate {
  name: string;
  email: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
}


export interface IUserListParams {
  nameLike?: string;
  emailLike?: string;
}
