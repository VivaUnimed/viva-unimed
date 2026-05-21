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

  private async execute() {
    console.log("RUNNING APPOINTMENT JOB ⏳");

    try {
      //Invalida matches que o paciente demorou para responder
      await service.request.setExpiredStatus();

      //Invalida vagas abertas que já passaram do horário
      await service.appointment.setExpiredPastAppointment();

      //Busca apenas as vagas que restaram abertas (e no futuro)
      const open = await service.appointment.listOpen();

      for(const apt of open) {
        try {
          await this.processAppointment(apt);
        } catch (e) {
          // Captura erros individuais para não parar o processamento das outras vagas
          console.error(`Erro ao processar appointment ID ${apt.id}:`, e);
        }
      }
    } catch (e) {
      console.error("Erro fatal na execução do job:", e);
    }

    console.log("APPOINTMENT JOB DONE ✅");
  }

  private async processAppointment(apt: IAppointment) {
    const pendingMatch = await service.appointment.hasPendingMatch(apt.id);
    if (pendingMatch) return; // Se já tem notificação rodando pra essa vaga, ignora

    const strategy = getMatchStrategy(apt.date)

    // Busca 1 ou 5 pessoas dependendo da estratégia
    const requests = await service.request.getNextBatchByAppointmentId(apt.id, strategy.batchSize);
    if (requests.length === 0) return;

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + strategy.expiresInMinutes);

    // Cria um Match para cada pessoa selecionada
    for (const req of requests) {
      const match = await service.appointment.addMatch({
      appointmentId: apt.id,
      requestId: req.id,
      status: "queued",
      expiresAt: expires,
    });

    console.log(`MATCH ADICIONADO APPOINTMENT=${apt.id} REQUEST=${req.id} MATCH=${match.id} EXPIRES=${expires.toISOString()}`);  }
  }
}
