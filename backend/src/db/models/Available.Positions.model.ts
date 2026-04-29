import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AvailablePositionAttributes {
  id_vaga: string;
  id_doctor: string;
  queue_id: string;
  data_time_vacancy: Date;
  status_vacancy: string;
}

type AvailablePositionCreationAttributes = Optional<
  AvailablePositionAttributes,
  'id_vaga'
>;

export class AvailablePosition
  extends Model<
    AvailablePositionAttributes,
    AvailablePositionCreationAttributes
  >
  implements AvailablePositionAttributes {

  public id_vaga!: string;
  public id_doctor!: string;
  public queue_id!: string;
  public data_time_vacancy!: Date;
  public status_vacancy!: string;
}

export function initAvailablePosition(sequelize: Sequelize): void {
  AvailablePosition.init(
    {
      id_vaga: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_doctor: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      queue_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      data_time_vacancy: {
        type: DataTypes.DATE, // vira timestamptz no PostgreSQL
        allowNull: false,
      },
      status_vacancy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'availablepositions',
      timestamps: false,
    }
  );
}