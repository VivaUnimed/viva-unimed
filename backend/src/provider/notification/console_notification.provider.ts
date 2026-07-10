import { IAppointment, IDoctor, ISpeciality, IUser, IPatient } from "shared";

interface IMatchNotification {
  speciality: ISpeciality;
  appointment: IAppointment;
  patient: IPatient;
  doctor: IDoctor;
}

// Nova interface para o cancelamento
interface ICancellationNotification {
  user: IUser;
  speciality: ISpeciality;
  appointment: IAppointment;
  reason: string;
}

export class ConsoleNotificationProvider {
  // Helper privado para centralizar a formatação de datas
  private formatAppointmentDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(date).replace(',', ' às');
  }

  /** Dispara notificação de vaga disponível (Chamado pelo Job) */
  sendMatchNotification(notification: IMatchNotification) {
    const formattedDate = this.formatAppointmentDate(notification.appointment.date);
    const userName = notification.patient?.name || 'Paciente';
    const doctorName = notification.doctor?.name ? `Dr(a). ${notification.doctor.name}` : 'nossa equipe';

    //TODO: temporário - remover depois.
    const colorCyan = "\x1b[36m";
    const colorGreen = "\x1b[32m";
    const colorYellow = "\x1b[33m";
    const colorReset = "\x1b[0m";

    const message = [
      `\n${colorCyan}╭──────────────────────────────────────────────────────────────${colorReset}`,
      `${colorCyan}│${colorReset} 📱 ${colorGreen}NOVA NOTIFICAÇÃO ENVIADA${colorReset}`,
      `${colorCyan}├──────────────────────────────────────────────────────────────${colorReset}`,
      `${colorCyan}│${colorReset} ${colorYellow}Destinatário:${colorReset} ${userName}`,
      `${colorCyan}│${colorReset}`,
      `${colorCyan}│${colorReset} Olá, ${userName}! 👋`,
      `${colorCyan}│${colorReset} Notamos seu interesse em ${notification.speciality.name} e temos uma`,
      `${colorCyan}│${colorReset} boa notícia: uma vaga acabou de ficar disponível!`,
      `${colorCyan}│${colorReset}`,
      `${colorCyan}│${colorReset} 📅 Data e hora: ${formattedDate}`,
      `${colorCyan}│${colorReset} 🩺 Profissional: ${doctorName}`,
      `${colorCyan}│${colorReset}`,
      `${colorCyan}│${colorReset} Se este horário funciona para você, reserve agora!`,
      `${colorCyan}╰──────────────────────────────────────────────────────────────${colorReset}\n`,
    ].join('\n');

    console.log(message);
  }

  /** Dispara notificação de consulta cancelada (Chamado pelo Event Listener) */
  sendCancellationNotification(notification: ICancellationNotification) {
    const formattedDate = this.formatAppointmentDate(notification.appointment.date);

    const message = [
      `🚨 Poxa, ${notification.user.name}, temos um aviso sobre a sua consulta.`,
      `A sua reserva para a especialidade de *${notification.speciality.name}* foi cancelada.`,
      `📅 Horário original: ${formattedDate}`,
      `💬 Motivo informado: "${notification.reason}"`,
      `⚠️ Mas não se preocupe! Sua solicitação voltou para a nossa fila inteligente e avisaremos assim que uma nova vaga aparecer.`
    ].join('\n');

    console.log(message);
  }
}
