import {
  IPatient,
  IPatientCreate,
  IPatientListParams,
  IPatientProfile,
  IPatientProfileUpdate,
  IPatientUpdate,
  IUserCreate,
  IUserUpdate,
} from "shared";
import PatientModel from "../db/models/patient.model";
import { BadRequest, Conflict, NotFound } from "../error";
import UserModel from "../db/models/user.model";
import RoleModel from "../db/models/role.model";
import { paginate } from "./helpers";
import { Op, Transaction } from "sequelize";
import { db } from "../db";
import { UserService } from "./user.service";
import { getPermissionsFromRoles } from "../entities";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";

const getSafeDate = (dateInput: Date | string): Date => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequest("Data de nascimento inválida.");
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
    ),
  );
};

export class PatientService {
  private userService = new UserService();

  private buildUserCreatePayload(data: IPatientCreate): IUserCreate {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();

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

  private buildUserUpdatePayload(
    data: IPatientUpdate | IPatientProfileUpdate,
    allowCpf = true,
  ): Partial<IUserUpdate> {
    const values: Partial<IUserUpdate> = {
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      phone: data.phone,
    };

    if (allowCpf && "cpf" in data) {
      values.cpf = data.cpf?.trim() || undefined;
    }

    return Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined),
    );
  }

  private async findPatientModel(
    id: number,
    options?: { transaction?: Transaction },
  ): Promise<PatientModel> {
    const model = await PatientModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          required: true,
        },
      ],
      transaction: options?.transaction,
    });

    if (!model) throw new NotFound();
    return model;
  }

  private async findPatientByUserId(
    userId: number,
    options?: { transaction?: Transaction },
  ): Promise<PatientModel> {
    const model = await PatientModel.findOne({
      where: { userId },
      include: [
        {
          model: UserModel,
          required: true,
          include: [RoleModel],
        },
      ],
      transaction: options?.transaction,
    });

    if (!model) throw new NotFound("Paciente não encontrado.");
    return model;
  }

  private async assertUserAvailable(
    userId: number,
    options?: { transaction?: Transaction },
  ): Promise<void> {
    const [user, existingPatient] = await Promise.all([
      UserModel.findByPk(userId, { transaction: options?.transaction }),
      PatientModel.findOne({
        where: { userId },
        transaction: options?.transaction,
      }),
    ]);

    if (!user) throw new NotFound("Usuário informado não foi encontrado.");
    if (existingPatient) {
      throw new Conflict("Já existe um paciente vinculado a este usuário.");
    }
  }

  /**
   * Cria paciente preservando o fluxo administrativo legado e o autocadastro.
   * Sem userId: cria User + Role Paciente + senha + Patient em uma transação.
   * Com userId: vincula um usuário existente (uso administrativo).
   */
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

      const model = await PatientModel.create(
        {
          birth: getSafeDate(data.birth),
          userId,
        },
        { transaction },
      );

      const patient = await this.getById(model.id, { transaction });
      await transaction.commit();
      return patient;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /** Atualiza dados do paciente pela visão administrativa. */
  async update(id: number, data: IPatientUpdate): Promise<IPatient> {
    const transaction = await db.transaction();

    try {
      const model = await this.findPatientModel(id, { transaction });
      const userPayload = this.buildUserUpdatePayload(data, true);

      if (Object.keys(userPayload).length) {
        const user = await this.userService.update(model.userId, userPayload, {
          transaction,
        });
        if (!user) throw new NotFound("Usuário vinculado não encontrado.");
      }

      if (data.birth !== undefined) {
        await model.update(
          { birth: getSafeDate(data.birth) },
          { transaction },
        );
      }

      const patient = await this.getById(id, { transaction });
      await transaction.commit();
      return patient;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /** Retorna o perfil do paciente identificado pelo JWT. */
  async getMe(userId: number): Promise<IPatientProfile> {
    const model = await this.findPatientByUserId(userId);
    const roles = model.user.roles?.map((role) => role.role) ?? [];

    return {
      ...PatientService.makePatient(model),
      patientId: model.id,
      roles,
      permissions: getPermissionsFromRoles(roles),
    };
  }

  /** Atualiza somente campos permitidos do próprio perfil. CPF não é alterável aqui. */
  async updateOwnProfile(
    userId: number,
    data: IPatientProfileUpdate,
  ): Promise<IPatientProfile> {
    const transaction = await db.transaction();

    try {
      const model = await this.findPatientByUserId(userId, { transaction });
      const userPayload = this.buildUserUpdatePayload(data, false);

      if (Object.keys(userPayload).length) {
        const user = await this.userService.update(userId, userPayload, {
          transaction,
        });
        if (!user) throw new NotFound("Usuário não encontrado.");
      }

      if (data.birth !== undefined) {
        await model.update(
          { birth: getSafeDate(data.birth) },
          { transaction },
        );
      }

      await transaction.commit();
      return this.getMe(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getById(
    id: number,
    options?: { transaction?: Transaction },
  ): Promise<IPatient> {
    const model = await this.findPatientModel(id, options);
    return PatientService.makePatient(model);
  }

  async list(params?: IPatientListParams): Promise<IPatient[]> {
    const searchTerm = params?.search ? `%${params.search}%` : undefined;
    const list = await PatientModel.findAll({
      include: [
        {
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
        },
      ],
      ...paginate(params),
      order: [["id", "DESC"]],
    });

    return list.map(PatientService.makePatient);
  }

  async delete(id: number): Promise<void> {
    const transaction = await db.transaction();

    try {
      const model = await this.findPatientModel(id, { transaction });
      const requests = await AppointmentRequestModel.findAll({
        where: { patientId: id },
        attributes: ["id"],
        transaction,
      });
      const requestIds = requests.map((request) => request.id);

      if (requestIds.length) {
        await AppointmentMatchModel.destroy({
          where: { requestId: requestIds },
          transaction,
        });
      }

      await AppointmentRequestModel.destroy({
        where: { patientId: id },
        transaction,
      });
      await model.destroy({ transaction });
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
