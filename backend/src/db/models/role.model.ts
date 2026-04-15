import { Column, DataType, Model, Table, BelongsToMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import UserModel from "./user.model";
import type { Role } from "shared";

/** Interface estendida para incluir os relacionamentos do modelo no TypeScript */
interface IRoleModel {
  id: number;
  role: Role;
  userId: number;
  users?: UserModel[];
}
/** Definição da tabela "users" e seus campos no banco de dados */
@Table({ tableName: "roles" })
export default class RoleModel extends Model<IRoleModel> {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare role: Role;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => UserModel)
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;
}
