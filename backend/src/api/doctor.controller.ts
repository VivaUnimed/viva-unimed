import type { IDoctor, IDoctorCreate } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
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
  // @Security(Guard.JWT, ['doctor.create'])
  create(@Body() data: IDoctorCreate): Promise<IDoctor> {
    return service.doctor.create(data);
  }

  /**
   * Atualiza os dados de um médico existente.
   */
  @Put("/{id}")
  @Security(Guard.JWT, ['doctor.edit'])
  update(@Path() id: number, @Body() data: IDoctorCreate): Promise<IDoctor> {
    return service.doctor.update(id, data);
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
  list(): Promise<IDoctor[]> {
    return service.doctor.list();
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
