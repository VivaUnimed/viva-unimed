import type {
  IPatient,
  IPatientCreate,
  IPatientListParams,
  IPatientProfile,
  IPatientProfileUpdate,
  IPatientUpdate,
} from "shared";
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
  Tags,
} from "tsoa";
import { Forbidden, Unauthorized } from "../error";
import { Guard, Security } from "./guards";

@Route("/api/patient")
@Tags("Patient")
export class PatientController extends Controller {
  /**
   * Autocadastro do paciente. Também mantém compatibilidade com o cadastro
   * do Admin. Se houver userId no payload, exige um usuário autenticado com
   * permissão patient.create para impedir vinculação arbitrária.
   */
  @Post()
  async create(
    @Request() req: Express.Request,
    @Body() data: IPatientCreate,
  ): Promise<IPatient> {
    if (data.userId !== undefined) {
      if (!req.user) throw new Unauthorized();
      const caller = await service.user.getById(req.user.userId);
      if (!caller?.permissions?.includes("patient.create")) {
        throw new Forbidden(["patient.create"]);
      }
    }

    return service.patient.create(data);
  }

  /** Perfil do paciente autenticado. */
  @Get("/me")
  @Security(Guard.JWT)
  getMe(@Request() req: Express.Request): Promise<IPatientProfile> {
    return service.patient.getMe(req.user.userId);
  }

  /** Edição do próprio perfil. */
  @Patch("/me")
  @Security(Guard.JWT)
  updateMe(
    @Request() req: Express.Request,
    @Body() data: IPatientProfileUpdate,
  ): Promise<IPatientProfile> {
    return service.patient.updateOwnProfile(req.user.userId, data);
  }

  /** Atualização administrativa (mantém PUT esperado pelo Admin). */
  @Put("/{id}")
  @Security(Guard.JWT, ["patient.edit"])
  update(
    @Path() id: number,
    @Body() data: IPatientUpdate,
  ): Promise<IPatient> {
    return service.patient.update(id, data);
  }

  @Get("/{id}")
  @Security(Guard.JWT, ["patient.read"])
  getById(@Path() id: number): Promise<IPatient> {
    return service.patient.getById(id);
  }

  @Get()
  @Security(Guard.JWT, ["patient.read"])
  list(@Queries() params?: IPatientListParams): Promise<IPatient[]> {
    return service.patient.list(params);
  }

  @Delete("/{id}")
  @Security(Guard.JWT, ["patient.delete"])
  delete(@Path() id: number): Promise<void> {
    return service.patient.delete(id);
  }
}
