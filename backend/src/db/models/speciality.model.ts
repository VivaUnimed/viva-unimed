import { Table, Column, Model, DataType, HasMany, BelongsToMany } from "sequelize-typescript";
import { ISpecialityCreate, ISpeciality } from "shared"
import DoctorSpecialityModel from "./doctor.speciality.model";
import DoctorModel from "./doctor.model";


@Table({
  tableName: "speciality",
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
  },
})
export default class SpecialityModel extends Model<ISpeciality, ISpecialityCreate>{
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @BelongsToMany(() => DoctorModel, () => DoctorSpecialityModel)
  declare doctors: DoctorModel[];
}

