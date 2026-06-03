import { Column, DataType, ForeignKey, Table, BelongsTo, Model, BelongsToMany } from "sequelize-typescript";
import UserModel from "./user.model";
import SpecialityModel from "./speciality.model";
import { IDoctor, IDoctorCreate, IDoctorInternal } from "shared";
import DoctorSpecialityModel from "./doctor.speciality.model";


@Table({
  tableName: "doctor",
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  },
})
export default class DoctorModel extends Model<IDoctorInternal, IDoctorCreate> {
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true })
  declare userId: number;

  @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
  declare crm: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare enabled: boolean;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @BelongsToMany(() => SpecialityModel, () => DoctorSpecialityModel)
  declare specialities: SpecialityModel[];
}
