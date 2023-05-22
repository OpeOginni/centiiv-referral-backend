import express from 'express'

import { getAllProductsController, createProductController, getProductByIdController, getProductByMerchantIdController, getProductByProductNameController, updateProductByIdController, deleteProductByIdController } from "../controllers/product.controller";
import { isMerchantAuthenticated, isMerchantOwner } from '../middlewares'

export default (router: express.Router) => {

    router.post('/product/create', isMerchantAuthenticated, createProductController);
    router.get('/product/allProducts', getAllProductsController);
    router.get('/product/getProduct/:productId', getProductByIdController);
    router.get('/product/getMerchantProducts/:productId', getProductByMerchantIdController);
    router.get('/product/getProductByName/:productName', getProductByProductNameController);
    router.patch('/product/:productId', updateProductByIdController);
    router.delete('/product/:productId', deleteProductByIdController)


};