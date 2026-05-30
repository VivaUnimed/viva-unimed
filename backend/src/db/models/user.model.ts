import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IUser } from "shared";

@Table({ tableName: "users" })
export default  class UserModel extends Model<IUser> {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false,  })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare email: string;
}

/**
 *
 *
 * Req HTTP
 *  => Controller (roteamento de chamada api)
 *    => Service (logica de negócio)
 *     => Model (representação da tabela do banco de dados)
 *      => DB
 */
