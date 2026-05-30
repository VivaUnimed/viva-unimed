export interface IUserCreate {
  name: string;
  email: string;
}

export interface IUser extends IUserCreate {
  id: number;
}
