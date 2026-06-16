import type { IPatient, IPatientCreate, IPatientListParams } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Queries, Route, Tags } from "tsoa";
import { Guard, Security } from "./guards";

/**
 * Controlador de pacientes.
 * Expõe as operações CRUD para o recurso de paciente.
 */
@Route("/api/patient")
@Tags("Patient")
export class PatientController extends Controller {
  /**
   * Cria um novo paciente.
   */
  @Post()
  @Security(Guard.JWT, ['patient.create'])
  create(@Body() data: IPatientCreate): Promise<IPatient> {
    return service.patient.create(data.userId, data);
  }

  /**
   * Atualiza os dados de um paciente existente.
   */
  @Put("/{id}")
  @Security(Guard.JWT, ['patient.edit'])
  update(@Path() id: number, @Body() data: Partial<Omit<IPatientCreate, 'userId'>>): Promise<IPatient> {
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
