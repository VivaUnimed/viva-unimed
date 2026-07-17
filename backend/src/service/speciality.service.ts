import { ISpeciality, ISpecialityCreate, ISpecialityListParams } from "shared";
import SpecialityModel from "../db/models/speciality.model"
import DoctorModel from "../db/models/doctor.model";
import { Conflict, NotFound } from "../error";
import { Op } from "sequelize";
import { paginate } from "./helpers";

/**
 * Serviço responsável pelas operações de especialidades.
 * Contém as regras de negócio e validações para criação,
 * edição, consulta e exclusão de especialidades.
 */
export class SpecialityService {
  /**
   * Cria uma nova especialidade.
   * Verifica conflitos de nome antes da criação.
   */
  async create(data: ISpecialityCreate): Promise<ISpeciality> {
    const exists = await SpecialityModel.findOne({ where: { name: data.name }});
    if(exists){
      throw new Conflict();
    }
    const model = await SpecialityModel.create(data);
    return model.get({ plain: true });
  }

  /**
   * Atualiza uma especialidade existente.
   * Verifica se o novo nome não conflita com outra especialidade.
   */
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

  /**
   * Busca uma especialidade pelo ID.
   * Lança NotFound caso não exista.
   */
  async getById(id: number): Promise<ISpeciality> {
    const model = await SpecialityModel.findByPk(id, {
      include: [
        {
          model: DoctorModel,
          required: false,
        }
      ],
    });
    if(!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /**
   * Lista todas as especialidades cadastradas.
   */
  async list(params?: ISpecialityListParams): Promise<ISpeciality[]> {
    const list = await SpecialityModel.findAll({
      include: [
        {
          model: DoctorModel,
          required: false,
        }
      ],
      where: params?.search ? {
        name: { [Op.iLike]: `%${params.search}%` }
      } : undefined,

      ...paginate(params),
      order: [['id', 'DESC']],
    });

    return list.map((model) => model.get({ plain: true }));
  }
  /**
   * Remove uma especialidade existente.
   * Lança NotFound caso o ID não exista.
   */
  async delete(id: number): Promise<void> {
    const model = await SpecialityModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
