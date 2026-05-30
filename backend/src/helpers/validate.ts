import Joi from "joi";

export function validate<T>(schema: Joi.ObjectSchema<T> | Joi.ArraySchema<T>, data: T | any): T {
  const { error, value } = schema.validate(data, {
    abortEarly: true,
    allowUnknown: false,
    convert: true,
   });
  if(error) {
    throw error;
  }
  return value;
}
