import { IPatient, IPatientCreate, IPatientListParams, IPatientUpdate, IUserCreate, IUserUpdate } from "shared";
import PatientModel from "../db/models/patient.model";
import { BadRequest, Conflict, NotFound } from "../error";
import UserModel from "../db/models/user.model";
import { paginate } from "./helpers";
import { Op, Transaction } from "sequelize";
import { db } from "../db";
import { UserService } from "./user.service";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";

export class PatientService {
  private userService = new UserService();

  private buildUserCreatePayload(data: IPatientCreate): IUserCreate {
    const name = data.name?.trim();
    const email = data.email?.trim();

    if (!name || !email) {
      throw new BadRequest("Informe nome e e-mail para criar o paciente.");
    }

    return {
      name,
      email,
      cpf: data.cpf?.trim() || undefined,
      phone: data.phone,
      password: data.password,
      roles: ["Paciente"],
    };
  }

  private buildUserUpdatePayload(data: IPatientUpdate): Partial<IUserUpdate> {
    return Object.fromEntries(
      Object.entries({
        name: data.name?.trim(),
        email: data.email?.trim(),
        cpf: data.cpf?.trim() || undefined,
        phone: data.phone,
      }).filter(([, value]) => value !== undefined),
    );
  }

  private async findPatientModel(id: number, options?: { transaction?: Transaction }): Promise<PatientModel> {
    const model = await PatientModel.findByPk(id, {
      include: [{
        model: UserModel,
        required: true,
      }],
      transaction: options?.transaction,
    });

    if (!model) {
      throw new NotFound();
    }

    return model;
  }

  private async assertUserAvailable(userId: number, options?: { transaction?: Transaction }): Promise<void> {
    const [user, existingPatient] = await Promise.all([
      UserModel.findByPk(userId, {
        transaction: options?.transaction,
      }),
      PatientModel.findOne({
        where: { userId },
        transaction: options?.transaction,
      }),
    ]);

    if (!user) {
      throw new NotFound("Usuário informado não foi encontrado.");
    }

    if (existingPatient) {
      throw new Conflict("Já existe um paciente vinculado a este usuário.");
    }
  }

  /** Cria um novo registro de paciente associado a um usuário */
  async create(data: IPatientCreate): Promise<IPatient> {
    const transaction = await db.transaction();

    try {
      let userId = data.userId;

      if (userId !== undefined && userId !== null) {
        await this.assertUserAvailable(userId, { transaction });
        await this.userService.addUserRole(userId, "Paciente", { transaction });
      } else {
        const user = await this.userService.create(
          this.buildUserCreatePayload(data),
          { transaction },
        );
        userId = user.id;
      }

      const model = await PatientModel.create({
        birth: data.birth,
        userId,
      }, {
        transaction,
      });

      const patient = await this.getById(model.id, { transaction });
      await transaction.commit();

      return patient;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /** Atualiza dados do paciente */
  async update(id: number, data: IPatientUpdate): Promise<IPatient> {
    const transaction = await db.transaction();

    try {
      const model = await this.findPatientModel(id, { transaction });
      const userPayload = this.buildUserUpdatePayload(data);

      if (Object.keys(userPayload).length) {
        const user = await this.userService.update(model.userId, userPayload, { transaction });
        if (!user) {
          throw new NotFound("Usuário vinculado ao paciente não foi encontrado.");
        }
      }

      if (data.birth !== undefined) {
        await model.update({
          birth: data.birth,
        }, {
          transaction,
        });
      }

      const patient = await this.getById(id, { transaction });
      await transaction.commit();

      return patient;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /** Busca paciente por ID */
  async getById(id: number, options?: { transaction?: Transaction }): Promise<IPatient> {
    const model = await this.findPatientModel(id, options);
    return PatientService.makePatient(model);
  }

  /** Lista todos os pacientes */
  async list(params?: IPatientListParams): Promise<IPatient[]> {
    const searchTerm = params?.search ? `%${params.search}%` : undefined;
    const list = await PatientModel.findAll({
      include: [{
        model: UserModel,
        required: true,
        where: searchTerm
          ? {
            [Op.or]: [
              { name: { [Op.iLike]: searchTerm } },
              { cpf: { [Op.iLike]: searchTerm } },
              { email: { [Op.iLike]: searchTerm } },
            ],
          }
          : undefined,
      }],
      ...paginate(params),
      order: [['id', 'DESC']],
    });

    return list.map(PatientService.makePatient);
  }

  /** Remove um paciente */
  async delete(id: number): Promise<void> {
    const transaction = await db.transaction();

    try {
      const model = await this.findPatientModel(id, { transaction });
      const requests = await AppointmentRequestModel.findAll({
        where: { patientId: id },
        attributes: ["id"],
        transaction,
      });
      const requestIds = requests.map(request => request.id);

      if (requestIds.length) {
        await AppointmentMatchModel.destroy({
          where: {
            requestId: requestIds,
          },
          transaction,
        });
      }

      await AppointmentRequestModel.destroy({
        where: { patientId: id },
        transaction,
      });

      await model.destroy({
        transaction,
      });

      await this.userService.delete(model.userId, {
        transaction,
        force: true,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static makePatient(model: PatientModel): IPatient {
    return {
      id: model.id,
      userId: model.userId,
      birth: model.birth,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      email: model.user.email,
      name: model.user.name,
      phone: model.user.phone,
      cpf: model.user.cpf,
    };
  }
}
