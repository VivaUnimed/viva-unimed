import type { IPatient, IPatientListParams, IPatientCreateInput, IPatientProfileUpdate } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Queries, Route, Tags, Request, Patch } from "tsoa";
import { Guard, Security } from "./guards";

/**
 * Controlador de pacientes.
 * Expõe as operações CRUD para o recurso de paciente.
 */
@Route("/api/patient")
@Tags("Patient")
export class PatientController extends Controller {

  /**
   * Cria um novo paciente (self-cadastro).
   * Pública — qualquer pessoa pode se cadastrar como paciente, sem
   * autenticação prévia. Não aceita reatribuição de role: o backend sempre
   * fixa a role como Paciente, ignorando qualquer valor enviado no payload.
   */
  @Post()
  create(@Body() data: IPatientCreateInput): Promise<IPatient> {
    return service.patient.createPatientComplete(data);
  }

   /**
   * Cria um novo paciente em nome de outra pessoa (cadastro assistido).
   * Restrita a técnico/admin — usada quando o próprio paciente não tem
   * como se auto-cadastrar (ex: atendimento por telefone na secretaria).
   * Mesma lógica de criação da rota pública, só muda quem pode acessar.
   */
  @Post("/assisted")
  @Security(Guard.JWT, ['patient.create'])
  createAssisted(@Body() data: IPatientCreateInput): Promise<IPatient> {
    return service.patient.createPatientComplete(data);
  }

  @Get("/me")
  @Security(Guard.JWT)
  async getMe(@Request() req: Express.Request): Promise<IPatient> {
    return service.patient.getMe(req.user.userId);
  }

  @Patch("/me")
  @Security(Guard.JWT)
  async updateMe(
    @Request() req: Express.Request,
    @Body() data: IPatientProfileUpdate,
  ): Promise<IPatient> {
    return service.patient.updateOwnProfile(req.user.userId, data);
  }
  /**
   * Atualiza os dados de um paciente existente.
   */
  @Patch("/{id}")
  @Security(Guard.JWT, ['patient.edit'])
  update(@Path() id: number, @Body() data: Partial<IPatientProfileUpdate>): Promise<IPatient> {
    return service.patient.update(id, data);
  }

  /**
   * Busca um paciente pelo ID.
   */
  @Get("/{id}")
  @Security(Guard.JWT, ['patient.read'])
  getById(@Path() id: number): Promise<IPatient> {
    return service.patient.getById(id);
  }

  /**
   * Lista todos os pacientes cadastrados.
   */
  @Get()
  @Security(Guard.JWT, ['patient.read'])
  list(@Queries() params?: IPatientListParams): Promise<IPatient[]> {
    return service.patient.list(params);
  }

  /**
   * Remove um paciente pelo ID.
   */
  @Delete("/{id}")
  @Security(Guard.JWT, ['patient.delete'])
  delete(@Path() id: number): Promise<void> {
    return service.patient.delete(id);
  }
}
