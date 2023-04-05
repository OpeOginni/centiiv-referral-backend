import Joi from "joi";

const validator = (schema: any) => (payload: any) =>
    schema.validate(payload, { abortEarly: false });

export const AUTH_REGISTER_BODY = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    country: Joi.string().required(),
    fullname: Joi.string().required(),
    username: Joi.string().required(),
});

export const AUTH_SIGN_IN_BODY = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const validateRegister = validator(AUTH_REGISTER_BODY);
export const validateLogin = validator(AUTH_SIGN_IN_BODY);