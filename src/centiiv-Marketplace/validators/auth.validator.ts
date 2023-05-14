import Joi from "joi";

const validator = (schema: any) => (payload: any) =>
    schema.validate(payload, { abortEarly: false });

export const AUTH_REGISTER_MERCHANT_BODY = Joi.object({
    merchantName: Joi.string().required(),
    buisnessName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    mobileNumber: Joi.number().required(),
    description: Joi.string().min(8).required(),
    location: Joi.string().required(),
    category: Joi.string().required(),
});

export const AUTH_USER_SIGN_IN_BODY = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const AUTH_MERCHANT_SIGN_IN_BODY = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const validateMerchantLogin = validator(AUTH_MERCHANT_SIGN_IN_BODY);
export const validateUserLogin = validator(AUTH_USER_SIGN_IN_BODY);
export const validateMerchantRegistration = validator(AUTH_REGISTER_MERCHANT_BODY);