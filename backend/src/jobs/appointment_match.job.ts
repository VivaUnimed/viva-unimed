import { IAppointment } from "shared";
import service from "../service"
import { CronJob } from 'cron';
import { getMatchStrategy } from "./strategy_selector.job";

interface AppointmentMatchJobOptions {
  cron: string;
}

export class AppointmentMatchJob {
  private job: CronJob;

  constructor(options: AppointmentMatchJobOptions) {
    this.job = CronJob.from({
      cronTime: options.cron,
      onTick: () => this.execute(),
      waitForCompletion: true,
    });
  }

  start() {
    this.job.start();
  }

  stop() {
    this.job.stop();
  }

  private async execute() {
    console.log(`\n\x1b[36m[Job - Match] 🔄 Iniciando cruzamento de vagas abertas com a fila de espera...\x1b[0m`);

    try {
      await service.request.setExpiredStatus();
      await service.appointment.setExpiredPastAppointment();

      const open = await service.appointment.listOpen();

      for(const apt of open) {
        try {
          await this.processAppointment(apt);
        } catch (e) {
          console.error(`\x1b[31m[Erro] Falha ao processar a vaga #${apt.id}:\x1b[0m`, e);
        }
      }
    } catch (e) {
      console.error(`\x1b[31m[Erro Crítico] Falha fatal na execução do Job de Match:\x1b[0m`, e);
    }

    // indica sucesso na finalização
    console.log(`\x1b[32m[Job - Match] ✅ Varredura concluída com sucesso.\x1b[0m\n`);
  }

  private async processAppointment(apt: IAppointment) {
    const pendingMatch = await service.appointment.hasPendingMatch(apt.id);
    if (pendingMatch) return; // Se já tem notificação rodando pra essa vaga, ignora

    // 1. Descobre o tamanho real da fila de interessados nesta vaga
    const queueSize = await service.request.getQueueSizeForAppointment(apt.id);

    if (queueSize === 0) return; // Ninguém na fila, não precisa gastar processamento

    // 2. Calcula a estratégia passando a quantidade de pacientes
    const strategy = getMatchStrategy(apt.date, queueSize);

    // Busca 1 ou 5 pessoas dependendo da estratégia
    const requests = await service.request.getNextBatchByAppointmentId(apt.id, strategy.batchSize);
    if (requests.length === 0) return;

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + strategy.expiresInMinutes);

    const formattedExpiration = expires.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Cria um Match para cada pessoa selecionada
    for (const req of requests) {
      try {
        const match = await service.appointment.addMatch({
          appointmentId: apt.id,
          requestId: req.id,
          status: "queued",
          expiresAt: expires,
        });

        console.log(`\x1b[90m  ↳ [Sistema] Match #${match.id} criado: Vaga #${apt.id} ➔ Pedido #${req.id} (Expira às ${formattedExpiration} - Estratégia: ${strategy.mode} / Fila: ${queueSize})\x1b[0m`);

      } catch (e) {
        console.error(`\x1b[31m[Erro] Falha ao criar match (Vaga #${apt.id} ➔ Pedido #${req.id}):\x1b[0m`, e);
      }
    }
  }
}
