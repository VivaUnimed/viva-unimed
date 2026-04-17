import type { IDoctor } from "./doctor";

export interface ISpecialityCreate {
  name: string;
}

export interface ISpeciality extends ISpecialityCreate {
  id: number;
  doctors?: IDoctor[];
}

