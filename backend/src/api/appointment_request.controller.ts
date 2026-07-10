import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Queries, Route, Tags } from "tsoa";
import type { IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams } from "shared";

@Route("/api/appointment-request")
@Tags("AppointmentRequest")
export class AppointmentRequestController extends Controller {
  /** Cria uma nova solicitação de consulta */
  @Post()
  create(@Body() data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    return service.request.create(data);
  }

  /** Atualiza uma solicitação de consulta existente */
  @Put("/{id}")
  update(@Path() id:number, @Body() data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    return service.request.update(id, data);
  }

  /** Busca uma solicitação de consulta por ID */
  @Get("/{id}")
  getById(@Path() id: number): Promise<IAppointmentRequest> {
    return service.request.getById(id);
  }

  /** Lista todas as solicitações de consulta */
  @Get()
  list(@Queries() params?: IAppointmentRequestListParams): Promise<IAppointmentRequest[]> {
    return service.request.list(params);
  }

  /** Remove uma solicitação de consulta por ID */
  @Delete("/{id}")
  delete(@Path() id: number): Promise<void> {
    return service.request.delete(id);
  }
}
