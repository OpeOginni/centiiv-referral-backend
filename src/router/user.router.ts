import express from 'express'

import { updateUser } from '../controllers/users'
import { isAuthenticated, isOwner } from '../middlewares'

export default (router: express.Router) => {
    router.get('/users/:id', updateUser);
    router.patch('/users/:id', isAuthenticated, isOwner, updateUser);
}