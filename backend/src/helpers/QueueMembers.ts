export interface IQueueMember {
  id: string;
  queueId: string;
  patientId: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
  createdAt: Date;
}

export interface IQueueMemberCreate {
  queueId: string;
  patientId: string;
  status: "ativo" | "inativo" | "aguardando" | "atendido";
}

export interface IQueueMemberUpdate {
  queueId?: string;
  patientId?: string;
  status?: "ativo" | "inativo" | "aguardando" | "atendido";
}