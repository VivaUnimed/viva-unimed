import { Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { IUser } from "shared";
import PasswordModel from "./password.model";
import RoleModel from "./role.model";
import DoctorModel from "./doctor.model";
import PatientModel from "./patient.model";


interface IUserModel extends IUser {
  password?: PasswordModel;
  doctor?: DoctorModel;
  patient?: PatientModel;
}

@Table({
  tableName: "users",
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
  },
})
export default  class UserModel extends Model<IUserModel> {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false,  })
  declare name: string;

  @Column({ type: DataType.STRING(14), allowNull: true, unique: true })
  declare cpf: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(20) })
  declare phone: string | number;

  @HasOne(() => PasswordModel)
  declare password?: PasswordModel;

  @HasMany(() => RoleModel)
  declare roles?: RoleModel[];

  @HasOne(() => DoctorModel)
  declare doctor: DoctorModel;

  @HasOne(() => PatientModel)
  declare patient?: PatientModel;
}
