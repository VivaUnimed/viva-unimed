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

  /* ============================================================
   * ROTAS DO PACIENTE
   * ============================================================
   *
   * O paciente utiliza /me.
   *
   * O patientId nunca vem do frontend.
   * O backend identifica o paciente através do JWT.
   * ============================================================
   */

  /**
   * Paciente entra em uma fila.
   *
   * POST /api/appointment-request/me
   */
  @Post("/me")
  @Security(
    Guard.JWT,
    ["schedule.request"],
  )
  createMine(
    @Request() req: Express.Request,

    @Body()
    data: IAppointmentRequestPatientCreate,
  ): Promise<IAppointmentRequest> {

    return service.request.createForPatient(
      req.user.userId,
      data,
    );
  }

  /**
   * Lista somente as filas
   * do paciente autenticado.
   *
   * GET /api/appointment-request/me
   */
  @Get("/me")
  @Security(
    Guard.JWT,
    ["schedule.read"],
  )
  listMine(
    @Request() req: Express.Request,

    @Queries()
    params?: IAppointmentRequestPatientListParams,
  ): Promise<IAppointmentRequest[]> {

    return service.request.listForPatient(
      req.user.userId,
      params,
    );
  }

  /**
   * Busca uma solicitação específica
   * pertencente ao paciente.
   *
   * GET /api/appointment-request/me/:id
   */
  @Get("/me/{id}")
  @Security(
    Guard.JWT,
    ["schedule.read"],
  )
  getMineById(
    @Request() req: Express.Request,

    @Path()
    id: number,
  ): Promise<IAppointmentRequest> {

    return service.request.getByIdForPatient(
      id,
      req.user.userId,
    );
  }

  /**
   * Atualiza uma solicitação
   * pertencente ao paciente.
   *
   * PATCH /api/appointment-request/me/:id
   */
  @Patch("/me/{id}")
  @Security(
    Guard.JWT,
    ["schedule.request"],
  )
  updateMine(
    @Request() req: Express.Request,

    @Path()
    id: number,

    @Body()
    data: Partial<IAppointmentRequestPatientCreate>,
  ): Promise<IAppointmentRequest> {

    return service.request.updateForPatient(
      id,
      req.user.userId,
      data,
    );
  }

  /**
   * Paciente sai somente
   * da própria fila.
   *
   * DELETE /api/appointment-request/me/:id
   */
  @Delete("/me/{id}")
  @Security(
    Guard.JWT,
    ["schedule.request"],
  )
  deleteMine(
    @Request() req: Express.Request,

    @Path()
    id: number,
  ): Promise<void> {

    return service.request.deleteForPatient(
      id,
      req.user.userId,
    );
  }


  /* ============================================================
   * ROTAS ADMINISTRATIVAS
   * ============================================================
   *
   * Mantemos os endpoints que o frontend Admin já utiliza.
   *
   * NÃO usam req.user como paciente.
   * ============================================================
   */

  /**
   * Admin adiciona um paciente à fila.
   *
   * POST /api/appointment-request
   */
  @Post()
  @Security(
    Guard.JWT,
    ["appointment.create"],
  )
  create(
    @Body()
    data: IAppointmentRequestCreate,
  ): Promise<IAppointmentRequest> {

    return service.request.create(
      data,
    );
  }

  /**
   * Admin atualiza uma solicitação.
   *
   * PUT /api/appointment-request/:id
   */
  @Put("/{id}")
  @Security(
    Guard.JWT,
    ["appointment.edit"],
  )
  update(
    @Path()
    id: number,

    @Body()
    data: Partial<IAppointmentRequestCreate>,
  ): Promise<IAppointmentRequest> {

    return service.request.update(
      id,
      data,
    );
  }

  /**
   * Admin busca uma solicitação.
   *
   * GET /api/appointment-request/:id
   */
  @Get("/{id}")
  @Security(
    Guard.JWT,
    ["appointment.read"],
  )
  getById(
    @Path()
    id: number,
  ): Promise<IAppointmentRequest> {

    return service.request.getById(
      id,
    );
  }

  /**
   * Admin lista todas as filas.
   *
   * GET /api/appointment-request
   */
  @Get()
  @Security(
    Guard.JWT,
    ["appointment.read"],
  )
  list(
    @Queries()
    params?: IAppointmentRequestListParams,
  ): Promise<IAppointmentRequest[]> {

    return service.request.list(
      params,
    );
  }

  /**
   * Admin remove/cancela uma solicitação.
   *
   * DELETE /api/appointment-request/:id
   */
  @Delete("/{id}")
  @Security(
    Guard.JWT,
    ["appointment.edit"],
  )
  delete(
    @Path()
    id: number,
  ): Promise<void> {

    return service.request.delete(
      id,
    );
  }
}