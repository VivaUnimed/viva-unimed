import { Column, DataType, ForeignKey, Table, BelongsTo, Model } from "sequelize-typescript";
import type { AppointmentRequestStatus, IAppointmentRequest, IAppointmentRequestCreate} from "shared";
import PatientModel from "./patient.model";
import SpecialityModel from "./speciality.model";
import DoctorModel from "./doctor.model";

@Table({ tableName: "appointment_request" })
export default class AppointmentRequestModel extends Model<IAppointmentRequest, IAppointmentRequestCreate> {
  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => PatientModel)
  declare patientId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => SpecialityModel)
  declare specialityId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  @ForeignKey(() => DoctorModel)
  declare doctorId?: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare status: AppointmentRequestStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  declare date: Date;

  @BelongsTo(() => PatientModel)
  declare patient: PatientModel;

  @BelongsTo(() => SpecialityModel)
  declare speciality: SpecialityModel;

  @BelongsTo(() => DoctorModel)
  declare doctor?: DoctorModel;
}
