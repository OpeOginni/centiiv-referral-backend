import express from 'express'

import authRouter from './auth.router';
import userRouter from './user.router'
import healthCheckRouter from './health-check.router';

const router = express.Router();

export default (): express.Router => {
    authRouter(router);
    userRouter(router);
    healthCheckRouter(router);

    return router;
}