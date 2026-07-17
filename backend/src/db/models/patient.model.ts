import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { IPatientInternal, IPatientRecordCreate } from "shared";
import UserModel from "./user.model";

@Table({
  tableName: "patients",
})
export default class PatientModel extends Model<IPatientInternal, IPatientRecordCreate> {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare birth: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => UserModel)
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  declare createdAt: Date;
  declare updatedAt: Date;

}
