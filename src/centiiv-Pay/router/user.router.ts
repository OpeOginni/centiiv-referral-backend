import express from 'express'

import { updateUser, getUser } from '../controllers/users'
import { isAuthenticated, isOwner } from '../middlewares'

export default (router: express.Router) => {
    router.get('/users/:id', getUser);
    router.patch('/users/:id', isAuthenticated, isOwner, updateUser);
}