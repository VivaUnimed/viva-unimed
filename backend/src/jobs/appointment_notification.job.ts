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

  start(){
    this.job.start();
  }

  stop(){
    this.job.stop();
  }

  private async execute(){
    console.log(`\n\x1b[34m[Job] ⏳ Iniciando varredura de notificações...\x1b[0m`);
    try {
      const matches = await service.request.listMatchesToNotify();
      if (!matches.length) {
        console.log("Não há match para notificações no momento.");
        return;
      }
      for (const match of matches) {
      // TODO: enviar notificação real (push)

        try {
          const patient = await service.patient.getById(match.request.patientId);
          const doctor = await service.doctor.getById(match.appointment.doctorId);
          console.log(`\nProcessando notificação para match ${match.id}`);
          provider.notification.sendMatchNotification({
            appointment: match.appointment,
            speciality: match.appointment.speciality,
            patient,
            doctor,
          });

          await service.request.updateMatchStatus(match.id, "waiting_response")

        } catch (e){
          console.error(`Falha ao processar match ${match.id}:`, e);
        }
      }
    } catch (e){
      console.error("Erro no job de notificação de agendamento: ", e);
    }
  }
}
