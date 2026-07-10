import { Column, DataType, ForeignKey, Table, BelongsTo, Model } from "sequelize-typescript";
import type { AppointmentMatchStatus, IAppointmentMatch, IAppointmentMatchCreate } from "shared";
import AppointmentRequestModel from "./appointment_request.model";
import AppointmentModel from "./appointment.model";

@Table({ tableName: "appointment_match" })
export default class AppointmentMatchModel extends Model<IAppointmentMatch, IAppointmentMatchCreate> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => AppointmentRequestModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare requestId: number;

  @BelongsTo(() => AppointmentRequestModel)
  declare request: AppointmentRequestModel;

  @ForeignKey(() => AppointmentModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare appointmentId: number;

  @BelongsTo(() => AppointmentModel)
  declare appointment: AppointmentModel;

  @Column( { type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column ({ type: DataType.STRING(20), allowNull: false })
  declare status: AppointmentMatchStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  declare respondedAt?: Date;

  declare createdAt: Date;
  declare updatedAt: Date;
}
