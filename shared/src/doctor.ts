import { IPaginate } from "./paginate";
import { ISpeciality } from "./speciality";
import { IUser, PhoneValue } from "./user";

export interface IDoctorCreate {
  userId: number;
  crm: string;
  enabled: boolean;
}

export interface IDoctorInternal extends IDoctorCreate {
  specialities?: ISpeciality[];
}

/**
 * Mantém compatibilidade com o Admin (campos de usuário no nível raiz)
 * e com as rotas do paciente (objeto user aninhado).
 */
export interface IDoctor {
  id: number;
  userId?: number;
  crm: string;
  enabled: boolean;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: PhoneValue;
  user?: IUser;
  specialities?: ISpeciality[];
}

export interface IDoctorListParams extends IPaginate {
  search?: string;
  specialityId?: number;
}
