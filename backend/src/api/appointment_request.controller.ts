import service from "../service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import type {
  IAppointmentRequest,
  IAppointmentRequestPatientCreate,
  IAppointmentRequestPatientListParams,
} from "shared";
import { Guard } from "./guards";

@Route("/api/appointment-request")
@Tags("AppointmentRequest")
export class AppointmentRequestController extends Controller {
  /**
   * Entra na fila inteligente usando o paciente identificado pelo JWT.
   * O frontend não envia patientId, status, attempts ou cooldownUntil.
   */
  @Post()
  @Security(Guard.JWT, ["schedule.request"])
  create(
    @Request() req: Express.Request,
    @Body() data: IAppointmentRequestPatientCreate,
  ): Promise<IAppointmentRequest> {
    return service.request.createForPatient(req.user.userId, data);
  }

  /** Atualiza apenas uma solicitação pertencente ao paciente autenticado. */
  @Patch("/{id}")
  @Security(Guard.JWT, ["schedule.request"])
  update(
    @Request() req: Express.Request,
    @Path() id: number,
    @Body() data: Partial<IAppointmentRequestPatientCreate>,
  ): Promise<IAppointmentRequest> {
    return service.request.updateForPatient(id, req.user.userId, data);
  }

  /** Busca apenas uma solicitação pertencente ao paciente autenticado. */
  @Get("/{id}")
  @Security(Guard.JWT, ["schedule.read"])
  getById(
    @Request() req: Express.Request,
    @Path() id: number,
  ): Promise<IAppointmentRequest> {
    return service.request.getByIdForPatient(id, req.user.userId);
  }

  /**
   * Lista somente as filas do paciente autenticado.
   * patientId recebido por query é ignorado por design e não faz parte da rota pública.
   */
  @Get()
  @Security(Guard.JWT, ["schedule.read"])
  list(
    @Request() req: Express.Request,
    @Queries() params?: IAppointmentRequestPatientListParams,
  ): Promise<IAppointmentRequest[]> {
    return service.request.listForPatient(req.user.userId, params);
  }

  /** Sai da fila somente quando a solicitação pertence ao paciente autenticado. */
  @Delete("/{id}")
  @Security(Guard.JWT, ["schedule.request"])
  delete(
    @Request() req: Express.Request,
    @Path() id: number,
  ): Promise<void> {
    return service.request.deleteForPatient(id, req.user.userId);
  }
}
