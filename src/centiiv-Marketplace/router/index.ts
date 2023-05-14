import express from 'express'

import authRouter from './auth.router';
import merchantRouter from './merchant.router'
import userRouter from './user.router';

const router: express.Router = express.Router();

export default (): express.Router => {
    authRouter(router);
    merchantRouter(router);
    userRouter(router);

    return router;
}