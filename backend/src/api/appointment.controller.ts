import service from "../service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";

import type {
  IAppointment,
  IAppointmentCreate,
} from "shared";

import { Guard } from "./guards";

/**
 * Controlador de agendamentos.
 * Expõe a API REST para criação,
 * atualização, leitura e exclusão de vagas.
 */
@Route("/api/appointment")
@Tags("Appointment")
export class AppointmentController extends Controller {

  /**
   * Cria uma nova vaga de consulta.
   */
  @Post()
  @Security(Guard.JWT, ["appointment.create"])
  create(
    @Request() req: Express.Request,
    @Body()
    data: Omit<
      IAppointmentCreate,
      "status" | "createdBy"
    >,
  ): Promise<IAppointment> {

    const userId = req.user.userId;

    return service.appointment.create({
      ...data,
      createdBy: userId,
    });
  }

  /**
   * Atualiza uma vaga.
   */
  @Patch("/{id}")
  @Security(Guard.JWT, ["appointment.edit"])
  update(
    @Path() id: number,
    @Body()
    data: Partial<
      Omit<
        IAppointmentCreate,
        "createdBy"
      >
    >,
  ): Promise<IAppointment> {

    return service.appointment.update(
      id,
      data,
    );
  }

  /**
   * Lista somente as consultas
   * pertencentes ao paciente autenticado.
   *
   * O patientId NÃO é recebido pelo frontend.
   * Ele é descoberto através do userId do JWT.
   */
  @Get("/me")
  @Security(Guard.JWT)
  listMine(
    @Request() req: Express.Request,
  ): Promise<IAppointment[]> {

    return service.appointment.listForPatient(
      req.user.userId,
    );
  }

  /**
   * Busca uma vaga por ID.
   *
   * Esta é uma operação administrativa.
   * Pacientes não utilizarão esta rota.
   */
  @Get("/{id}")
  @Security(Guard.JWT, ["appointment.read"])
  getById(
    @Path() id: number,
  ): Promise<IAppointment> {

    return service.appointment.getById(id);
  }

  /**
   * Lista todas as vagas.
   *
   * Esta é uma operação administrativa.
   */
  @Get()
  @Security(Guard.JWT, ["appointment.read"])
  list(): Promise<IAppointment[]> {

    return service.appointment.list();
  }

  /**
   * Remove uma vaga.
   */
  @Delete("/{id}")
  @Security(Guard.JWT, ["appointment.delete"])
  delete(
    @Path() id: number,
  ): Promise<void> {

    return service.appointment.delete(id);
  }
}