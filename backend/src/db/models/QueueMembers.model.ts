import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface QueueMemberAttributes {
  id_membro_fila: string;
  fila_id: string;
  patient_id: string;
  status: 'ativo' | 'inativo' | 'aguardando' | 'atendido';
  createdAt: Date;
}

type QueueMemberCreationAttributes = Optional<
  QueueMemberAttributes,
  'id_membro_fila' | 'createdAt'
>;

export class QueueMember
  extends Model<QueueMemberAttributes, QueueMemberCreationAttributes>
  implements QueueMemberAttributes {

  public id_membro_fila!: string;
  public fila_id!: string;
  public patient_id!: string;
  public status!: 'ativo' | 'inativo' | 'aguardando' | 'atendido';
  public createdAt!: Date;
}

export function initQueueMember(sequelize: Sequelize): void {
  QueueMember.init(
    {
      id_membro_fila: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fila_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      patient_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ativo', 'inativo', 'aguardando', 'atendido'),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'Queue_members',
      timestamps: false, // você já definiu createdAt manualmente
    }
  );
}

