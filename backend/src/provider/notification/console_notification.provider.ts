import { IAppointment, ISpeciality, IUser } from "shared";

interface IMatchNotification{
  user: IUser,
  speciality: ISpeciality,
  appointment: IAppointment,
}

export class ConsoleNotificationProvider{
  sendMatchNotification(notification: IMatchNotification){
    // Formata para o padrão brasileiro (Ex: dd/mm/aaaa às h:m)
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo' // Garante o horário de Brasília
    }).format(notification.appointment.date).replace(',', ' às');

    const message = [
      `Olá, ${notification.user.name}! 👋 `,
      `Notamos seu interesse em ${notification.speciality.name} e temos uma boa notícia: uma vaga acabou de ficar disponível!`,
      `📅 Data e hora: ${formattedDate}`,
      `Se este horário funciona para você, reserve agora pelo botão abaixo.`
    ].join('\n')

    console.log(message)
  }
}
