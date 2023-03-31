// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import crypto from 'crypto';
import bcrypt from "bcrypt";

const saltRounds = parseInt(process.env.SALT_ROUNDS as string);


export const random = () => crypto.randomBytes(128).toString('base64');
export const authentication = (password: string) => {
    return bcrypt.hash(password, saltRounds)
}

export const comparePassword = (passedPassword: string, encryptedPassword: string) => {
    return bcrypt.compare(passedPassword, encryptedPassword);
}