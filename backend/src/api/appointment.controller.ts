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
import type { IAppointment, IAppointmentCreate } from "shared";
import { Guard } from "./guards";

@Route("/api/appointment")
@Tags("Appointment")
export class AppointmentController extends Controller {
  /** Cria uma vaga (Admin/Técnico). */
  @Post()
  @Security(Guard.JWT, ["appointment.create"])
  create(
    @Request() req: Express.Request,
    @Body() data: Omit<IAppointmentCreate, "status" | "createdBy">,
  ): Promise<IAppointment> {
    return service.appointment.create({
      ...data,
      createdBy: req.user.userId,
    });
  }

  /** Atualiza uma vaga. */
  @Patch("/{id}")
  @Security(Guard.JWT, ["appointment.edit"])
  update(
    @Path() id: number,
    @Body() data: Partial<Omit<IAppointmentCreate, "createdBy">>,
  ): Promise<IAppointment> {
    return service.appointment.update(id, data);
  }

  /** Lista somente as consultas confirmadas do paciente autenticado. */
  @Get("/me")
  @Security(Guard.JWT)
  listMine(@Request() req: Express.Request): Promise<IAppointment[]> {
    return service.appointment.listForPatient(req.user.userId);
  }

  /** Rotas gerais mantidas para o Admin. */
  @Get("/{id}")
  @Security(Guard.JWT, ["appointment.read"])
  getById(@Path() id: number): Promise<IAppointment> {
    return service.appointment.getById(id);
  }

  @Get()
  @Security(Guard.JWT, ["appointment.read"])
  list(): Promise<IAppointment[]> {
    return service.appointment.list();
  }

  @Delete("/{id}")
  @Security(Guard.JWT, ["appointment.delete"])
  delete(@Path() id: number): Promise<void> {
    return service.appointment.delete(id);
  }
}
