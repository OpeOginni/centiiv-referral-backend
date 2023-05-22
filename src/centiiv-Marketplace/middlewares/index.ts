import express from 'express'
import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../../model/users';
import { getMerchantBySessionToken } from '../../model/merchant';


export const isUserAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export const isMerchantAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const bearerToken = req.headers.authorization;
        const token = bearerToken.split(" ")[1];
        const sessionToken = token

        if (!sessionToken) {
            return res.status(403).json({ success: false, message: "you have to be logged in" })
        }

        const exisitingMerchant = await getMerchantBySessionToken(sessionToken);

        if (!exisitingMerchant) {
            return res.sendStatus(403);
        }

        merge(req, { identiy: exisitingMerchant });

        // TODO: Pass the merchant in the cookie
        // const cookieOptions = {
        //     expires: new Date(
        //         Date.now() + 30 * 24 * 60 * 60 * 1000 // To make the cookie expire 90 days from when it was created
        //     ),
        //     // secure: true,
        //     httpOnly: true,
        // };
        // res.cookie('merchant', exisitingMerchant, cookieOptions); // Creating a Cookie that keeps the jwt

        console.log(exisitingMerchant)
        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const isMerchantOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentMerchantId = get(req, 'identiy._id') as string;
        console.log(currentMerchantId)

        if (!currentMerchantId) {
            return res.sendStatus(403);
        }


        if (currentMerchantId.toString() != id) {
            return res.sendStatus(403);
        }

        next()

    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const isUserOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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