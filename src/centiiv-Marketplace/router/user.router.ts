import express from 'express'

import { updateUser, getUser } from '../controllers/user.controller'
import { isUserAuthenticated, isUserOwner } from '../middlewares'

export default (router: express.Router) => {
    router.get('/users/:id', getUser);
    router.patch('/users/:id', isUserAuthenticated, isUserOwner, updateUser);
}