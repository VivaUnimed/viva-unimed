import service from "../service";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Queries, Route, Security, Tags } from "tsoa";
import type { IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams } from "shared";
import { Guard } from "./guards";

@Route("/api/appointment-request")
@Tags("AppointmentRequest")
export class AppointmentRequestController extends Controller {
  /** Cria uma nova solicitação de consulta */
  @Post()
  @Security(Guard.JWT, ['schedule.request'])
  create(@Body() data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    return service.request.create(data);
  }

  /** Atualiza uma solicitação de consulta existente */
  @Patch("/{id}")
  @Security(Guard.JWT, ['schedule.request'])
  update(@Path() id:number, @Body() data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    return service.request.update(id, data);
  }

  /** Busca uma solicitação de consulta por ID */
  @Get("/{id}")
  @Security(Guard.JWT, ['schedule.read'])
  getById(@Path() id: number): Promise<IAppointmentRequest> {
    return service.request.getById(id);
  }

  /** Lista todas as solicitações de consulta */
  @Get()
  @Security(Guard.JWT, ['schedule.read'])
  list(@Queries() params?: IAppointmentRequestListParams): Promise<IAppointmentRequest[]> {
    return service.request.list(params);
  }

  /** Remove uma solicitação de consulta por ID */
  @Delete("/{id}")
  @Security(Guard.JWT, ['schedule.request'])
  delete(@Path() id: number): Promise<void> {
    return service.request.delete(id);
  }
}
