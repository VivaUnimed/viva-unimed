import service from "../service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Put,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import type {
  IAppointmentRequest,
  IAppointmentRequestCreate,
  IAppointmentRequestListParams,
  IAppointmentRequestPatientCreate,
  IAppointmentRequestPatientListParams,
} from "shared";
import { Guard } from "./guards";

@Route("/api/appointment-request")
@Tags("AppointmentRequest")
export class AppointmentRequestController extends Controller {
  /* ========================= PACIENTE ========================= */

  /** Entra na própria fila. patientId/status são definidos no backend. */
  @Post("/me")
  @Security(Guard.JWT, ["schedule.request"])
  createMine(
    @Request() req: Express.Request,
    @Body() data: IAppointmentRequestPatientCreate,
  ): Promise<IAppointmentRequest> {
    return service.request.createForPatient(req.user.userId, data);
  }

  /** Lista somente as filas do paciente autenticado. */
  @Get("/me")
  @Security(Guard.JWT, ["schedule.read"])
  listMine(
    @Request() req: Express.Request,
    @Queries() params?: IAppointmentRequestPatientListParams,
  ): Promise<IAppointmentRequest[]> {
    return service.request.listForPatient(req.user.userId, params);
  }

  @Get("/me/{id}")
  @Security(Guard.JWT, ["schedule.read"])
  getMineById(
    @Request() req: Express.Request,
    @Path() id: number,
  ): Promise<IAppointmentRequest> {
    return service.request.getByIdForPatient(id, req.user.userId);
  }

  @Patch("/me/{id}")
  @Security(Guard.JWT, ["schedule.request"])
  updateMine(
    @Request() req: Express.Request,
    @Path() id: number,
    @Body() data: Partial<IAppointmentRequestPatientCreate>,
  ): Promise<IAppointmentRequest> {
    return service.request.updateForPatient(id, req.user.userId, data);
  }

  /** Sai somente da própria fila. */
  @Delete("/me/{id}")
  @Security(Guard.JWT, ["schedule.request"])
  deleteMine(
    @Request() req: Express.Request,
    @Path() id: number,
  ): Promise<void> {
    return service.request.deleteForPatient(id, req.user.userId);
  }

  /* =========================== ADMIN ========================== */
  /* Mantém exatamente os caminhos consumidos pelo frontend Admin. */

  @Post()
  @Security(Guard.JWT, ["schedule.aprove"])
  create(@Body() data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    return service.request.create(data);
  }

  @Put("/{id}")
  @Security(Guard.JWT, ["schedule.aprove"])
  update(
    @Path() id: number,
    @Body() data: Partial<IAppointmentRequestCreate>,
  ): Promise<IAppointmentRequest> {
    return service.request.update(id, data);
  }

  @Get("/{id}")
  @Security(Guard.JWT, ["schedule.aprove"])
  getById(@Path() id: number): Promise<IAppointmentRequest> {
    return service.request.getById(id);
  }

  @Get()
  @Security(Guard.JWT, ["schedule.aprove"])
  list(
    @Queries() params?: IAppointmentRequestListParams,
  ): Promise<IAppointmentRequest[]> {
    return service.request.list(params);
  }

  @Delete("/{id}")
  @Security(Guard.JWT, ["schedule.aprove"])
  delete(@Path() id: number): Promise<void> {
    return service.request.delete(id);
  }
}
