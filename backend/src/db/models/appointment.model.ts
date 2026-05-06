import { Column, DataType, ForeignKey, Table, BelongsTo, Model } from "sequelize-typescript";
import type { AppointmentStatus, IAppointment, IAppointmentCreate } from "shared";
import DoctorModel from "./doctor.model";
import SpecialityModel from "./speciality.model";
import UserModel from "./user.model";


@Table({ tableName: "appointment" })
export default class AppointmentModel extends Model<IAppointment, IAppointmentCreate> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare date: Date;

  @ForeignKey(() => DoctorModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare doctorId: number;

  @BelongsTo(() => DoctorModel)
  declare doctor: DoctorModel;

  @ForeignKey(() => SpecialityModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare specialityId: number;

  @BelongsTo(() => SpecialityModel)
  declare speciality: SpecialityModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare createdBy: number;

  @BelongsTo(() => UserModel)
  declare createdByUser: UserModel;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare status: AppointmentStatus;

}
