import service from "../service";
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
import type {
  AppointmentMatchStatus,
  IAppointmentMatch,
  IAppointmentMatchCreate,
} from "shared";
import { Guard } from "./guards";

@Route("/api/match")
@Tags("Match")
export class MatchController extends Controller {
  /** Vincula um pedido da fila a uma vaga disponível. */
  @Post("/")
  @Security(Guard.JWT, ["appointment.edit"])
  @SuccessResponse("201", "Created")
  async createMatch(
    @Body() requestBody: IAppointmentMatchCreate,
  ): Promise<IAppointmentMatch> {
    this.setStatus(201);
    return service.appointment.addMatch(requestBody);
  }

  /**
   * Lista os alertas/ofertas do paciente autenticado.
   * Sem status informado, retorna primeiro apenas ofertas aguardando resposta.
   */
  @Get("/mine")
  @Security(Guard.JWT)
  async listMine(
    @Request() req: Express.Request,
    @Query() status?: AppointmentMatchStatus,
    @Query() includeHistory: boolean = false,
  ): Promise<IAppointmentMatch[]> {
    return service.request.listPatientMatches(
      req.user.userId,
      status,
      includeHistory,
    );
  }

  /** Confirma uma oferta pertencente ao paciente autenticado. */
  @Post("/{matchId}/confirm")
  @Security(Guard.JWT)
  async confirm(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.confirmMatch(matchId, req.user.userId);
  }

  /** Recusa uma oferta pertencente ao paciente autenticado. */
  @Post("/{matchId}/reject")
  @Security(Guard.JWT)
  async reject(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.rejectMatch(matchId, req.user.userId);
  }

  /** Cancela um match aceito pertencente ao paciente autenticado. */
  @Post("/{matchId}/cancel")
  @Security(Guard.JWT)
  async cancel(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.cancelMatch(matchId, req.user.userId);
  }

  /** Busca uma oferta somente quando ela pertence ao paciente autenticado. */
  @Get("/{matchId}")
  @Security(Guard.JWT)
  async getById(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<IAppointmentMatch> {
    return service.request.getPatientMatch(matchId, req.user.userId);
  }
}
