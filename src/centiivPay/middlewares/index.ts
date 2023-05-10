import express from 'express'
import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../../model/users';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const bearerToken = req.headers.authorization;
        const token = bearerToken.split(" ")[1];
        const sessionToken = token

        if (!sessionToken) {
            return res.status(403).json({ success: false, message: "you have to be logged in" })
        }

        const exisitingUser = await getUserBySessionToken(sessionToken);

        if (!exisitingUser) {
            return res.sendStatus(403);
        }

        merge(req, { identiy: exisitingUser });
        console.log(exisitingUser)
        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identiy._id') as string;
        console.log(currentUserId)

        if (!currentUserId) {
            return res.sendStatus(403);
        }


        if (currentUserId.toString() != id) {
            return res.sendStatus(403);
        }

        next()

    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}