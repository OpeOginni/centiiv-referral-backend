import Joi from "joi";

const validator = (schema: any) => (payload: any) =>
    schema.validate(payload, { abortEarly: false });

export const GET_USER = Joi.object({
    id: Joi.string().required(),
});

export const UPDATE_USER = Joi.object({
    // //
});



export const valudateGetUser = validator(GET_USER);
export const validateUpdateUser = validator(UPDATE_USER);
