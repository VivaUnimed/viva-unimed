import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { IUser } from "shared";
import PasswordModel from "./password.model";


interface IUserModel extends IUser {
  password?: PasswordModel;
}

@Table({ tableName: "users" })
export default  class UserModel extends Model<IUserModel> {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false,  })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare email: string;

  @HasOne(() => PasswordModel)
  declare password: PasswordModel;
}
