import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AdministratorAttributes {
  user_id: string;
}

type AdministratorCreationAttributes = Optional<
  AdministratorAttributes,
  never
>;

export class Administrator
  extends Model<AdministratorAttributes, AdministratorCreationAttributes>
  implements AdministratorAttributes {

  public user_id!: string;
}

export function initAdministrator(sequelize: Sequelize): void {
  Administrator.init(
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true, // assumindo que cada admin é único pelo user_id
      },
    },
    {
      sequelize,
      tableName: 'administrator',
      timestamps: false,
    }
  );
}