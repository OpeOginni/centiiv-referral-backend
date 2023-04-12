import express from 'express'

import { register, login } from "../controllers/auth.controller"

export default (router: express.Router) => {

    router.post('/auth/login', login);
    router.post('/auth/register', register);

};