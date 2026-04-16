import { ISpeciality, ISpecialityCreate } from "shared";
import SpecialityModel from "../db/models/speciality.model"
import { Conflict, NotFound } from "../error";
import { Op } from "sequelize";

export class SpecialityService {
  async create(data: ISpecialityCreate): Promise<ISpeciality> {
    const exists = await SpecialityModel.findOne({ where: { name: data.name }});
    if(exists){
      throw new Conflict();
    }
    const model = await SpecialityModel.create(data);
    return model.get({ plain: true });
  }

  async update(id:number, data: ISpecialityCreate): Promise<ISpeciality> {
    const exists = await SpecialityModel.findOne({ where: {
      name: data.name,
      id: { [Op.ne]: id },
    }});
    if(exists){
      throw new Conflict();
    }
    const model = await SpecialityModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    await model.update(data);
    return model.get({ plain: true });
  }

  async getById(id: number): Promise<ISpeciality> {
    const model = await SpecialityModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  async list(): Promise<ISpeciality[]> {
    const list = await SpecialityModel.findAll();
    return list.map((model) => model.get({ plain: true }))
  }

  async delete(id: number): Promise<void> {
    const model = await SpecialityModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
