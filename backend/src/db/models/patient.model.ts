import { Table, Column, Model, DataType, HasMany, BelongsToMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import { IPatientCreate, IPatient } from "shared/src/patient"
import UserModel from "./user.model";
// import AppointmentModel from "./appointment.model";

@Table({ tableName: "patients" })

export default class PatientModel extends Model<IPatient, IPatientCreate> {
  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare birth: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => UserModel)
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

}
