import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";

import PatientModel from "./patient.model";
import QueueWaitingModel from "./QueueWaiting.model";

export interface IQueueMember {
  id: string;
  queueId: string;
  patientId: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt: Date;
}

export interface IQueueMemberCreate
  extends Omit<IQueueMember, "id"> {}

@Table({
  tableName: "queue_members",
  timestamps: false,
})
export default class QueueMemberModel extends Model<
  IQueueMember,
  IQueueMemberCreate
> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => QueueWaitingModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare queueId: string;

  @ForeignKey(() => PatientModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare patientId: string;

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

  @BelongsTo(() => QueueWaitingModel)
  declare queue: QueueWaitingModel;

  @BelongsTo(() => PatientModel)
  declare patient: PatientModel;
}