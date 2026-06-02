import { IAppointment, ISpeciality, IUser } from "shared";

interface IMatchNotification {
  user: IUser;
  speciality: ISpeciality;
  appointment: IAppointment;
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

    const message = [
      `Olá, ${notification.user.name}! 👋 `,
      `Notamos seu interesse em ${notification.speciality.name} e temos uma boa notícia: uma vaga acabou de ficar disponível!`,
      `📅 Data e hora: ${formattedDate}`,
      `Se este horário funciona para você, reserve agora pelo botão abaixo.`
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
