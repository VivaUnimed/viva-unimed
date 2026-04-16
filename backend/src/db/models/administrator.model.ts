import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from "sequelize-typescript";
import { IUser } from "shared";
import UserModel from "./user.model";

interface IAdministrador{bra
  user_Id: number;
  
}

@Table({ tableName: "administrador" })
export default  class AdministradorModel extends Model<IAdministrador> 
{
  @Column({ primaryKey: true })
  @ForeignKey(() => AdministradorModel)
  declare user_Id: number;
  @BelongsTo(() => UserModel) // Cria o relacionamento
  declare user: UserModel;
}