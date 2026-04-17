import { Column, DataType, ForeignKey, Table, BelongsTo, Model, PrimaryKey } from "sequelize-typescript";
import UserModel from "./user.model";
import SpecialityModel from "./speciality.model";
import { IUser, ISpeciality } from "shared";
import DoctorModel from "./doctor.model";


interface IDoctorSpecialityCreate {
  userId: number;
  specialityId: number;
}

interface IDoctorSpeciality extends IDoctorSpecialityCreate {
  id: number;
  user?: IUser;
  speciality?: ISpeciality;
}

@Table({ tableName: "doctor_speciality", timestamps: false })
export default class DoctorSpecialityModel extends Model<IDoctorSpeciality, IDoctorSpecialityCreate> {
  @ForeignKey(() => DoctorModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @ForeignKey(() => SpecialityModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare specialityId: number;

  @BelongsTo(() => DoctorModel, { foreignKey: 'userId' })
  declare doctor: DoctorModel;

  @BelongsTo(() => SpecialityModel, { foreignKey: 'specialityId' })
  declare speciality: SpecialityModel;
}
