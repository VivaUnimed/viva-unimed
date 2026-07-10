import { Table, Column, Model, DataType, HasMany, BelongsToMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import { IPatientCreate, IPatientInternal } from "shared/src/patient"
import UserModel from "./user.model";
// import AppointmentModel from "./appointment.model";

@Table({
  tableName: "patients",
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  },
})
export default class PatientModel extends Model<IPatientInternal, IPatientCreate> {
  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare birth: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => UserModel)
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

}
