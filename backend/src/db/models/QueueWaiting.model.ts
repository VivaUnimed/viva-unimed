import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface QueueWaitingAttributes {
  id_queue: string;
  specialty_searched: string;
  id_doctor: string;
  createdAt: Date;
  status: boolean;
}

type QueueWaitingCreationAttributes = Optional<
  QueueWaitingAttributes,
  'id_queue' | 'createdAt' | 'status'
>;

export class QueueWaiting
  extends Model<
    QueueWaitingAttributes,
    QueueWaitingCreationAttributes
  >
  implements QueueWaitingAttributes {

  public id_queue!: string;
  public specialty_searched!: string;
  public id_doctor!: string;
  public createdAt!: Date;
  public status!: boolean;
}

export function initQueueWaiting(sequelize: Sequelize): void {
  QueueWaiting.init(
    {
      id_queue: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      specialty_searched: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      id_doctor: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE, // vira timestamptz no PostgreSQL
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'queues_waiting',
      timestamps: false, // você já definiu createdAt manualmente
    }
  );
}