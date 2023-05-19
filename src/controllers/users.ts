import express from 'express'

import { getUserById, deleteAllUsers } from '../model/users'

export const getUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;

        const user = await getUserById(id);
        return res.status(200).json({ success: true, user })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const updateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!username) {
            return res.sendStatus(400)
        }

        const user = await getUserById(id);

        user.username = username;
        await user.save();
        return res.status(200).json({ success: true, user })

    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const deleteUsers = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        await deleteAllUsers();
        return res.sendStatus(200)
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}