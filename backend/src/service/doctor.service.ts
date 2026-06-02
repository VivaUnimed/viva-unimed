import { IDoctor, IDoctorCreate } from "shared";
import DoctorModel from "../db/models/doctor.model";
import { Conflict, NotFound } from "../error";
import { Op } from "sequelize";
import UserModel from "../db/models/user.model";

/**
 * Serviço responsável pelas operações de médico.
 * Contém validações de unicidade e tratamento de erros
 * para criação, atualização, consulta e remoção.
 */
export class DoctorService {
  /**
   * Cria um médico novo.
   * Verifica se já existe outro médico com o mesmo CRM.
   */
  async create(data: IDoctorCreate): Promise<IDoctor> {
    // Garante que não existam médicos com o mesmo CRM.
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

  /**
   * Atualiza dados de um médico existente.
   * Garante que o CRM não conflite com outro registro.
   */
  async update(id: number, data: IDoctorCreate): Promise<IDoctor> {
    // Valida conflito ignorando o próprio registro sendo atualizado.
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

  /**
   * Busca um médico pelo ID.
   * Lança NotFound caso o registro não seja encontrado.
   */
  async getById(id: number): Promise<IDoctor> {
    const model = await DoctorModel.findByPk(id, {
      include: [UserModel],
    });
    if (!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /**
   * Lista todos os médicos.
   */
  async list(): Promise<IDoctor[]> {
    const list = await DoctorModel.findAll({
      include: [UserModel],
    });
    return list.map((model) => model.get({ plain: true }));
  }

  /**
   * Remove um médico pelo ID.
   * Lança NotFound se o médico não existir.
   */
  async delete(id: number): Promise<void> {
    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
