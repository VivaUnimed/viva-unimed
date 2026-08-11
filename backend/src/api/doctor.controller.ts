import type { DoctorCreateFacade, IDoctor, IDoctorCreate, IDoctorListParams, IDoctorUpdate } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Queries, Route, Tags } from "tsoa";
import { Guard, Security } from "./guards";

/**
 * Controlador de médicos.
 * Expõe operações CRUD para o recurso de médico.
 */
@Route("/api/doctor")
@Tags("Doctor")
export class DoctorController extends Controller {
  /**
   * Cria um novo médico.
   */
  @Post()
  @Security(Guard.JWT, ['doctor.create'])
  create(@Body() data: DoctorCreateFacade): Promise<IDoctor> {
    return service.doctor.createComplete(data);
  }

  /**
   * Atualiza os dados de um médico existente.
   */
  @Patch("/{id}")
  @Security(Guard.JWT, ['doctor.edit'])
  update(@Path() id: number, @Body() data: IDoctorUpdate): Promise<IDoctor> {
    return service.doctor.update(id, data);
  }

  /**
   * Adiciona uma especialidate a um medico.
   */
  @Post("/{id}/speciality")
  @Security(Guard.JWT, ['doctor.create'])
  async addSpeciality(@Path() id: number, @Body() data: { specialityId: number }): Promise<void> {
    await service.doctor.addSpeciality(id, data.specialityId);
  }

  /**
   * Remove uma especialidate de um medico.
   */
  @Delete("/{id}/speciality")
  @Security(Guard.JWT, ['doctor.create'])
  async removeSpeciality(@Path() id: number, @Body() data: { specialityId: number }): Promise<void> {
    await service.doctor.removeSpeciality(id, data.specialityId);
  }

  /**
   * Busca um médico pelo ID.
   */
  @Get("/{id}")
  @Security(Guard.JWT, ['doctor.read'])
  getById(@Path() id: number): Promise<IDoctor> {
    return service.doctor.getById(id);
  }

  /**
   * Lista todos os médicos cadastrados.
   */
  @Get()
  @Security(Guard.JWT, ['doctor.read'])
  list(@Queries() params?: IDoctorListParams): Promise<IDoctor[]> {
    return service.doctor.list(params);
  }

  /**
   * Remove um médico pelo ID.
   */
  @Delete("/{id}")
  @Security(Guard.JWT, ['doctor.delete'])
  delete(@Path() id: number): Promise<void> {
    return service.doctor.delete(id);
  }
}
