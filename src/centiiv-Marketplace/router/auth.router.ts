import express from 'express'

import { loginMerchant, registerMerchant, loginUser } from "../controllers/auth.controller";

export default (router: express.Router) => {

    router.post('/auth/loginMerchant', loginMerchant);
    router.post('/auth/registerMerchant', registerMerchant);
    router.post('/auth/loginUser', loginUser);
};