import service from "../service";
import { Body, Controller, Get, Path, Post, Route, SuccessResponse, Tags } from "tsoa";
import type { IAppointmentMatch, IAppointmentMatchCreate } from "shared";

@Route("/api/match")
@Tags("Match")
export class MatchController extends Controller {

  /**
   * Vincula um pedido da fila a uma vaga disponível (Gera o Match)
   */
  @Post("/")
  @SuccessResponse("201", "Created")
  async createMatch(@Body() requestBody: IAppointmentMatchCreate): Promise<any> {
    return service.appointment.addMatch(requestBody);
  }


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
