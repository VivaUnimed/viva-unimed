import type { IDoctor, IDoctorCreate } from "shared";
import service from "../service";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { Guard, Security } from "./guards";

@Route("/api/doctor")
@Tags("Doctor")
export class DoctorController extends Controller {
  @Post()
  // @Security(Guard.JWT, ['doctor.create'])
  create(@Body() data: IDoctorCreate): Promise<IDoctor> {
    return service.doctor.create(data);
  }

  @Put("/{id}")
  @Security(Guard.JWT, ['doctor.edit'])
  update(@Path() id: number, @Body() data: IDoctorCreate): Promise<IDoctor> {
    return service.doctor.update(id, data);
  }

  @Get("/{id}")
  @Security(Guard.JWT, ['doctor.read'])
  getById(@Path() id: number): Promise<IDoctor> {
    return service.doctor.getById(id);
  }

  @Get()
  @Security(Guard.JWT, ['doctor.read'])
  list(): Promise<IDoctor[]> {
    return service.doctor.list();
  }

  @Delete("/{id}")
  @Security(Guard.JWT, ['doctor.delete'])
  delete(@Path() id: number): Promise<void> {
    return service.doctor.delete(id);
  }
}