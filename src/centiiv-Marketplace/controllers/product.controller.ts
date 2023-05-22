import express from 'express'

import { getAllProducts, createProduct, getProductByMerchantId, getProductByProductName, getProductById, deleteProductById, updateProductById } from '../../model/product'

export const getAllProductsController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        const products = await getAllProducts();
        return res.status(200).json({ success: true, products })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const createProductController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { productName, productPrice, deliveryLocation, productDescription, productImages, productSize } = req.body;

        const { merchant } = req.cookies;

        const product = await createProduct({
            productName, productPrice, deliveryLocation, productDescription, productImages, productSize, merchant
        })

        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}


export const getProductByIdController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { productId } = req.params;

        const product = await getProductById(productId);
        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const getProductByMerchantIdController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { merchantId } = req.params;

        const product = await getProductByMerchantId(merchantId);
        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const getProductByProductNameController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { productName } = req.params;

        const product = await getProductByProductName(productName);
        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const updateProductByIdController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { productId } = req.params;

        const { updateValues } = req.body

        const product = await updateProductById(productId, updateValues);
        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

export const deleteProductByIdController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { productId } = req.params;


        await deleteProductById(productId);
        return res.status(200).json({ success: true, message: "Product deleted successfully" })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}
