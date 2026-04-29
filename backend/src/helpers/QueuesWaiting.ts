export interface IQueueWaiting {
  id: string;
  doctor_availability_id: string;
  available_positions_id: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt: Date;
}

export interface IQueueWaitingCreate {
  doctor_availability_id: string;
  available_positions_id: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt: Date;
}

export interface IQueueWaitingUpdate {
  doctor_availability_id?: string;
  available_positions_id?: string;
  status?: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt?: Date;
}