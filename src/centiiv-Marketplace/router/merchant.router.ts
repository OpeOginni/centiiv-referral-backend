import express from 'express'

import { getMerchant } from '../controllers/merchants.controller'
import { isMerchantAuthenticated, isMerchantOwner } from '../middlewares'

export default (router: express.Router) => {
    router.get('/merchants/:id', getMerchant);
    // TODO: Update Merchant
    // router.patch('/merchants/:id', isMerchantAuthenticated, isMerchantOwner, updateUser);
}