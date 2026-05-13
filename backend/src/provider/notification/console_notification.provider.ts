import { IAppointment, ISpeciality, IUser } from "shared";

interface IMatchNotification{
  user: IUser,
  speciality: ISpeciality,
  appointment: IAppointment,
}

export class ConsoleNotificationProvider{
  sendMatchNotification(notification: IMatchNotification){
    const message = [
      `Olá ${notification.user.name}. Vimos que você tem interesse na especilidade ${notification.speciality.name}.`,
      `Temos uma vaga para consulta disponível no dia e horário seguinte: ${notification.appointment.date}.`,
      "Caso tenha interesse, clique abaixo para reservar este horário. ",
    ].join('\n')

    console.log(message)
  }
}
