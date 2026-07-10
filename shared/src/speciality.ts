import type { IDoctor } from "./doctor";
import { IPaginate } from "./paginate";

export interface ISpecialityCreate {
  name: string;
}

export interface ISpeciality extends ISpecialityCreate {
  id: number;
  doctors?: IDoctor[];
}

export interface ISpecialityListParams extends IPaginate {
  search?: string;
}
