import { CronJob } from "cron";
import service from "../service";
import provider from "../provider"

export interface IAppointmentNotificationJobOptions {
  cron: string;
}

export class AppointmentNotificationJob {
  private job: CronJob;
  constructor(options: IAppointmentNotificationJobOptions){
    this.job = CronJob.from({
        cronTime: options.cron,
        onTick: () => this.execute(),
        waitForCompletion: true,
      });
  }

  async start(){
    this.job.start();
  }

  private async execute(){
    console.log("RUNNING NOTIFICATION JOB ⏳");
    try {
      const matches = await service.request.listMatchesToNotify();
      if (!matches.length) {
        console.log("Não há match para notificações no momento.");
        return;
      }
      for (const match of matches) {
      // TODO: enviar notificação real (push)
        try {
          console.log(`Processando notificação para match ${match.id}`);
          provider.notification.sendMatchNotification( {
            appointment: match.appointment,
            speciality: match.appointment.speciality,
            user: match.request.patient.user,
          });

          await service.request.updateMatchStatus(match.id, "waiting_response")

        } catch (innerError){
          console.error(`Falha ao processar match ${match.id}:`, innerError);
        }
      }
    } catch (error){
      console.error("Erro no job de notificação de agendamento: ", error);
    }
  }
}
