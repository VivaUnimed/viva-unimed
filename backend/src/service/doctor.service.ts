import { IDoctor, IDoctorCreate, IDoctorInternal, IDoctorListParams, IUser } from "shared";
import DoctorModel from "../db/models/doctor.model";
import { BadRequest, Conflict, NotFound } from "../error";
import { Op, WhereOptions } from "sequelize";
import UserModel from "../db/models/user.model";
import SpecialityModel from "../db/models/speciality.model";
import { paginate } from "./helpers";
import DoctorSpecialityModel from "../db/models/doctor.speciality.model";
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
    if(data.crm?.length > 4) {
      throw new BadRequest("crm inválido");
    }
    // Garante que não existam médicos com o mesmo CRM.
    const exists = await DoctorModel.findOne({
      where: {
        [Op.or]: [
          { crm: data.crm },
          { userId: data.userId },
        ]
      }
    });

    if (exists) {
      throw new Conflict("O médico já está cadastrado no sistema.");
    }

    const model = await DoctorModel.create(data);
    return await this.getById(model.userId);
  }

  /**
   * Atualiza dados de um médico existente.
   * Garante que o CRM não conflite com outro registro.
   */
  async update(id: number, data: IDoctorCreate): Promise<IDoctor> {
    if(data.crm?.length > 4) {
      throw new BadRequest("crm inválido");
    }
    const exists = await DoctorModel.findOne({
      where: {
        [Op.or]: [
          { crm: data.crm },
        ],
        userId: { [Op.ne]: id },
      }
    });

    if (exists) {
      throw new Conflict("existe um outro médico com o mesmo crm");
    }

    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    await model.update(data);
    return await this.getById(model.userId);
  }

  /**
   * Busca um médico pelo ID.
   * Lança NotFound caso o registro não seja encontrado.
   */
  async getById(id: number): Promise<IDoctor> {
    const model = await DoctorModel.findByPk(id, {
      include: [UserModel, SpecialityModel],
    });
    if (!model) {
      throw new NotFound();
    }
    return DoctorService.makeDoctor(model);
  }

  async addSpeciality(userId: number, specialityId: number) {
    const doctor = await this.getById(userId);
    if(doctor.specialities.find(s => s.id === specialityId)) {
      return;
    }
    await DoctorSpecialityModel.create({
      specialityId,
      userId,
    })
  }

  async removeSpeciality(userId: number, specialityId: number) {
    const doctor = await this.getById(userId);
    if(!doctor.specialities.find(s => s.id === specialityId)) {
      return;
    }
    await DoctorSpecialityModel.destroy({
      where: {
        specialityId,
        userId,
      }
    });
  }

  /**
   * Lista todos os médicos.
   */
  async list(params?: IDoctorListParams): Promise<IDoctor[]> {
    const where: WhereOptions<IDoctorInternal> = {};

    if(params?.search) {
      const searchTerm = params?.search ? `%${params.search}%` : undefined;
      where[Op.or] = [
        { crm: { [Op.iLike]: searchTerm } },
        { "$user.name$": { [Op.iLike]: searchTerm } },
        { "$user.email$": { [Op.iLike]: searchTerm } },
      ]
    }

    if(params?.specialityId) {
      const doctorSpeciality = await DoctorSpecialityModel.findAll({
        where: { specialityId: params.specialityId },
        attributes: ["userId"],
      });
      if(!doctorSpeciality.length) {
        return [];
      }
      where.userId = doctorSpeciality.map(ds => ds.userId);
    }

    const list = await DoctorModel.findAll({
      include: [
        {
          model: UserModel,
          required: true,
        },
        {
          model: SpecialityModel,
        }
      ],
      where,
      ...paginate(params),
      order: [["userId", "DESC"]],
    });

    return list.map(DoctorService.makeDoctor);
  }

  static makeDoctor(model: DoctorModel): IDoctor {
    return {
      crm: model.crm,
      enabled: model.enabled,
      id: model.user.id,
      email: model.user.email,
      name: model.user.name,
      phone: model.user.phone,
      specialities: model?.specialities.map(s => ({
        id: s.id,
        name: s.name,
      })),
    }
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
