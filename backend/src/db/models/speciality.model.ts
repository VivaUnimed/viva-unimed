import { Table, Column, Model, DataType } from "sequelize-typescript";
import { ISpecialityCreate, ISpeciality } from "shared"


@Table({ tableName: "speciality", paranoid: true })
export default class SpecialityModel extends Model<ISpeciality, ISpecialityCreate>{
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;
}

