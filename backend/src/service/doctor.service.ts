import { IDoctor, IDoctorCreate } from "shared";
import DoctorModel from "../db/models/doctor.model";
import { Conflict, NotFound } from "../error";
import { Op } from "sequelize";

export class DoctorService {
  async create(data: IDoctorCreate): Promise<IDoctor> {
    // Garante que não existam médicos com o mesmo CRM ou atrelados ao mesmo User
    const exists = await DoctorModel.findOne({
      where: {
        [Op.or]: [
          { crm: data.crm },
        ]
      }
    });

    if (exists) {
      throw new Conflict();
    }

    const model = await DoctorModel.create(data);
    return model.get({ plain: true });
  }

  async update(id: number, data: IDoctorCreate): Promise<IDoctor> {
    // Valida conflito ignorando o próprio registro sendo atualizado
    const exists = await DoctorModel.findOne({
      where: {
        [Op.or]: [
          { crm: data.crm },
        ],
        id: { [Op.ne]: id },
      }
    });

    if (exists) {
      throw new Conflict();
    }

    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    await model.update(data);
    return model.get({ plain: true });
  }

  async getById(id: number): Promise<IDoctor> {
    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  async list(): Promise<IDoctor[]> {
    const list = await DoctorModel.findAll();
    return list.map((model) => model.get({ plain: true }));
  }

  async delete(id: number): Promise<void> {
    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}