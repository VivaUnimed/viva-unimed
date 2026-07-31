import { IPaginate } from "shared";
import { Op } from "sequelize";
import UserModel from "../db/models/user.model";
import { Conflict } from "../error";

export function paginate(params?: IPaginate) {
  const size = params?.size || 100;
  const page = params?.page || 0;
  return {
    limit: size,
    offset: page * size,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export async function assertUniqueUserIdentity(email: string, cpf?: string): Promise<{
  normalizedEmail: string;
  normalizedCpf?: string;
}> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCpf = cpf ? normalizeCpf(cpf) : undefined;

  const emailExists = await UserModel.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });
  if (emailExists) {
    throw new Conflict("Já existe um usuário cadastrado com este e-mail.");
  }

  if (normalizedCpf) {
    const cpfExists = await UserModel.findOne({
      where: { cpf: normalizedCpf },
    });
    if (cpfExists) {
      throw new Conflict("Já existe um usuário cadastrado com este CPF.");
    }
  }

  return {
    normalizedEmail,
    normalizedCpf,
  };
}
