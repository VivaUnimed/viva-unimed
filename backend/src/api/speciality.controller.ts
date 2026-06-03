import type { ISpeciality, ISpecialityCreate, ISpecialityListParams } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Queries, Route, Tags } from "tsoa";
import { Guard, Security } from "./guards";

/**
 * Controlador de especialidades.
 * Expõe as operações CRUD para o recurso de especialidade.
 */
@Route("/api/speciality")
@Tags("Speciality")
export class SpecialityController extends Controller {
  /**
   * Cria uma nova especialidade.
   */
  @Post()
  @Security(Guard.JWT, ['speciality.create'])
  create(@Body() data: ISpecialityCreate): Promise<ISpeciality> {
    return service.speciality.create(data);
  }

  /**
   * Atualiza a especialidade especificada pelo ID.
   */
  @Put("/{id}")
  @Security(Guard.JWT, ['speciality.edit'])
  update(@Path() id:number, @Body() data: ISpecialityCreate): Promise<ISpeciality> {
    return service.speciality.update(id, data);
  }

  /**
   * Busca uma especialidade pelo ID.
   */
  @Get("/{id}")
  @Security(Guard.JWT, ['speciality.read'])
  getById(@Path() id: number): Promise<ISpeciality> {
    return service.speciality.getById(id);
  }

  /**
   * Lista todas as especialidades.
   */
  @Get()
  @Security(Guard.JWT, ['speciality.read'])
  list(@Queries() params?: ISpecialityListParams ): Promise<ISpeciality[]> {
    return service.speciality.list(params);
  }

  /**
   * Remove a especialidade especificada pelo ID.
   */
  @Delete("/{id}")
  @Security(Guard.JWT, ['speciality.delete'])
  delete(@Path() id: number): Promise<void> {
    return service.speciality.delete(id);
  }
}
