import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";

import DoctorAvailabilityModel from "./DoctorAvailability.model";
import AvailablePositionsModel from "./Available.Positions.model";

export interface IQueueWaiting {
  id: string;
  doctor_availability_id: string;
  available_positions_id: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt: Date;
}

export interface IQueueWaitingCreate
  extends Omit<IQueueWaiting, "id"> {}

@Table({
  tableName: "queue_waiting",
  timestamps: false,
})
export default class QueueWaitingModel extends Model<
  IQueueWaiting,
  IQueueWaitingCreate
> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => AvailablePositionsModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare available_positions_id: string;

  @ForeignKey(() => DoctorAvailabilityModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare doctor_availability_id: string;

  @Column({
    type: DataType.ENUM("ativo", "inativo", "aguardando", "atendido"),
    allowNull: false,
  })
  declare status: "ativo" | "inativo" | "aguardando" | "atendido";

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @BelongsTo(() => AvailablePositionsModel)
  declare availablePosition: AvailablePositionsModel;

  @BelongsTo(() => DoctorAvailabilityModel)
  declare doctorAvailability: DoctorAvailabilityModel;
}