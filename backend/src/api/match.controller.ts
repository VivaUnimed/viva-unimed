import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Request, Route, Tags } from "tsoa";
import type { IAppointmentMatch } from "shared";

//Controlador de Matches

@Route("/api/match")
@Tags("Match")
export class MatchController extends Controller {
  // Confirmação de agendamento pelo paciente
  @Post('/{matchId}/confirm')
  async confirm(@Path() matchId: number): Promise<void> {
    return service.request.confirmMatch(matchId);
  }

  //Desfaz uma confirmação de agendamento feita por engano ou desistência, respeitando as regras de limite de tempo
  @Post('/{matchId}/cancel')
  async reject(@Path() matchId: number): Promise<void> {
    return service.request.cancelMatch(matchId);
  }

  @Get("/{matchId}")
  getById(@Path() matchId: number): Promise<IAppointmentMatch> {
    return service.request.getMatch(matchId);
  }
}
