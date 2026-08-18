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
  /** Criação manual/sistêmica de match: somente perfis administrativos. */
  @Post("/")
  @Security(Guard.JWT, ["appointment.edit"])
  @SuccessResponse("201", "Created")
  async createMatch(
    @Body() requestBody: IAppointmentMatchCreate,
  ): Promise<IAppointmentMatch> {
    this.setStatus(201);
    return service.appointment.addMatch(requestBody);
  }

  /** Lista somente ofertas do paciente identificado pelo JWT. */
  @Get("/mine")
  @Security(Guard.JWT)
  listMine(
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

  @Post("/{matchId}/confirm")
  @Security(Guard.JWT)
  confirm(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.confirmMatch(matchId, req.user.userId);
  }

  @Post("/{matchId}/reject")
  @Security(Guard.JWT)
  reject(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.rejectMatch(matchId, req.user.userId);
  }

  @Post("/{matchId}/cancel")
  @Security(Guard.JWT)
  cancel(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<void> {
    return service.request.cancelMatch(matchId, req.user.userId);
  }

  @Get("/{matchId}")
  @Security(Guard.JWT)
  getById(
    @Request() req: Express.Request,
    @Path() matchId: number,
  ): Promise<IAppointmentMatch> {
    return service.request.getPatientMatch(matchId, req.user.userId);
  }
}
