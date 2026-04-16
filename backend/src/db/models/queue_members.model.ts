import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface MembroFilaAttributes {
  id_membro_fila: string;
  fila_id: string;
  patient_id: string;
  status: 'ativo' | 'inativo' | 'aguardando' | 'atendido';
  createdAt: Date;
}

type MembroFilaCreationAttributes = Optional<
  MembroFilaAttributes,
  'id_membro_fila' | 'createdAt'
>;

export class MembroFila
  extends Model<MembroFilaAttributes, MembroFilaCreationAttributes>
  implements MembroFilaAttributes {

  public id_membro_fila!: string;
  public fila_id!: string;
  public patient_id!: string;
  public status!: 'ativo' | 'inativo' | 'aguardando' | 'atendido';
  public createdAt!: Date;
}

export function initMembroFila(sequelize: Sequelize): void {
  MembroFila.init(
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
      tableName: 'membro_fila',
      timestamps: false, // você já declarou createdAt manualmente
    }
  );
}