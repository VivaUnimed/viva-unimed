import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AgendamentoAttributes {
  id_agendamento: string;
  id_paciente: string;
  id_vaga: string;
  id_doctor: string;
  data_confirmacao: Date;
  tipo_vaga: string;
}

type AgendamentoCreationAttributes = Optional<
  AgendamentoAttributes,
  'id_agendamento' | 'data_confirmacao'
>;

export class Agendamento
  extends Model<AgendamentoAttributes, AgendamentoCreationAttributes>
  implements AgendamentoAttributes {

  public id_agendamento!: string;
  public id_paciente!: string;
  public id_vaga!: string;
  public id_doctor!: string;
  public data_confirmacao!: Date;
  public tipo_vaga!: string;
}

export function initAgendamento(sequelize: Sequelize): void {
  Agendamento.init(
    {
      id_agendamento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      id_paciente: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      id_vaga: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      id_doctor: {
        type: DataTypes.UUID, // assumindo UUID, porque coerência ainda é moda
        allowNull: false,
      },
      data_confirmacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      tipo_vaga: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'agendamento',
      timestamps: false,
    }
  );
}