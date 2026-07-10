import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Request, Route, Security, Tags } from "tsoa";
import type { IAppointment, IAppointmentCreate } from "shared";
import { Guard } from "./guards";

/**
 * Controlador de agendamentos.
 * Expõe a API REST para criação, atualização, leitura e exclusão de vagas.
 */
@Route("/api/appointment")
@Tags("Appointment")
export class AppointmentController extends Controller {
  /**
   * Cria uma nova vaga de consulta.
   */
  @Post()
  @Security(Guard.JWT, ['appointment.create'])
  create(
    @Request() req: Express.Request,
    @Body() data: Omit<IAppointmentCreate, 'status'|'createdBy'>
  ): Promise<IAppointment> {
    const userId = req.user.userId;
    return service.appointment.create({
      ...data,
      createdBy: userId,
    });
  }

  /**
   * Busca uma vaga de consulta por ID.
   */
  @Get("/{id}")
  getById(@Path() id: number): Promise<IAppointment> {
    return service.appointment.getById(id);
  }

  /**
   * Lista todas as vagas de consulta.
   */
  @Get()
  list(): Promise<IAppointment[]> {
    return service.appointment.list();
  }

  /**
   * Remove uma vaga de consulta pelo ID.
   */
  @Delete("/{id}")
  delete(@Path() id: number): Promise<void> {
    return service.appointment.delete(id);
  }
}
