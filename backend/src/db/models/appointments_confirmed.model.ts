import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AppointmentConfirmedAttributes {
  id_agendamento: string;
  id_paciente: string;
  id_vaga: string;
  id_doctor: string;
  data_confirmacao: Date;
  tipo_vaga: string;
}

type AppointmentConfirmedCreationAttributes = Optional<
  AppointmentConfirmedAttributes,
  'id_agendamento' | 'data_confirmacao'
>;

export class AppointmentConfirmed
  extends Model<
    AppointmentConfirmedAttributes,
    AppointmentConfirmedCreationAttributes
  >
  implements AppointmentConfirmedAttributes {

  public id_agendamento!:string ;
  public id_paciente!: string;
  public id_vaga!: string;
  public id_doctor!: string;
  public data_confirmacao!: Date;
  public tipo_vaga!: string;
}

export function initAppointmentConfirmed(sequelize: Sequelize): void {
  AppointmentConfirmed.init(
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
        type: DataTypes.UUID,
        allowNull: false,
      },
      data_confirmacao: {
        type: DataTypes.DATE, // Sequelize já trata como timestamptz no Postgres
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
      tableName: 'appointments confirmed', // sim, isso exige aspas no SQL
      timestamps: false,
    }
  );
}