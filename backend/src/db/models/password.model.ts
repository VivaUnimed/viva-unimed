import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from "sequelize-typescript";
import { IUser } from "shared";
import UserModel from "./user.model";

interface IPassword {
  userId: number;
  hash: string;
  salt: string;
}

@Table({ tableName: "passwords" })
export default  class PasswordModel extends Model<IPassword> {
  @Column({ primaryKey: true })
  @ForeignKey(() => UserModel)
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @Column({ type: DataType.STRING(128), allowNull: false })
  declare hash: string;

  @Column({ type: DataType.STRING(32), allowNull: false })
  declare salt: string;
}
