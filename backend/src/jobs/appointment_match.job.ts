import { IAppointment } from "shared";
import service from "../service"
import { setTimeout } from "node:timers/promises";
import { CronJob } from 'cron';

interface AppointmentMatchJobOptions {
  cron: string;
}

export class AppointmentMatchJob {
  private job: CronJob;
  constructor(private options: AppointmentMatchJobOptions) {
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
    console.log("STARTING APPOINTMENT JOB ⏳");
    const open = await service.appointment.listOpen();
    for(const apt of open) {
      // TODO: try / catch
      await this.processAppointment(apt);
    }
    console.log("APPOINTMENT JOB DONE ✅");
  }

  private async processAppointment(apt: IAppointment) {
    const pendingMatch = await service.appointment.hasPendingMatch(apt.id);
    if(pendingMatch) return;

    const request = await service.request.getNextByAppointmentId(apt.id);
    if(!request) return;

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);

    const match = await service.appointment.addMatch({
      appointmentId: apt.id,
      requestId: request.id,
      status: "queued",
      expiresAt: expires,
    });

    console.log(`MATCH ADICIONADO APPOINTMENT=${apt.id} REQUEST=${request.id} MATCH=${match.id} EXPIRES=${expires.toISOString()}`);
  }
}
