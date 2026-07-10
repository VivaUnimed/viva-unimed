import service from "../service";
import { Controller, Get, Path, Post, Route, Tags } from "tsoa";
import type { IAppointmentMatch } from "shared";

@Route("/api/match")
@Tags("Match")
export class MatchController extends Controller {

  /**
   * Confirmação de agendamento pelo paciente.
   */
  @Post('/{matchId}/confirm')
  async confirm(@Path() matchId: number): Promise<void> {
    return service.request.confirmMatch(matchId);
  }

  /**
   * Recusa a vaga oferecida pela fila.
   * Aplica a penalidade (cooldown) e passa a vaga para o próximo.
   */
  @Post('/{matchId}/reject')
  async reject(@Path() matchId: number): Promise<void> {
    return service.request.rejectMatch(matchId);
  }

  /**
   * Desfaz uma confirmação de agendamento feita por engano ou desistência.
   * Ação: O paciente se arrependeu APÓS já ter aceitado a vaga.
   * Respeita as regras de limite de tempo (15 min ou 24h).
   */
  @Post('/{matchId}/cancel')
  async cancel(@Path() matchId: number): Promise<void> {
    return service.request.cancelMatch(matchId);
  }

  /**
   * Busca os detalhes e o status atual de uma oferta de vaga.
   */
  @Get("/{matchId}")
  getById(@Path() matchId: number): Promise<IAppointmentMatch> {
    return service.request.getMatch(matchId);
  }
}
