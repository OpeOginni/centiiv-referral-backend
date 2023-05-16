import express from 'express'

import { register, login, referedRegistration, verifySignUp } from "../controllers/auth.controller"

export default (router: express.Router) => {

    router.post('/auth/login', login);
    router.post('/auth/register', register);
    // router.post('/auth/refregistration', referedRegistration);
    router.post('/auth/refRegistration', referedRegistration);
    router.get('/auth/verifyRegistration/:email/:token', verifySignUp);
};