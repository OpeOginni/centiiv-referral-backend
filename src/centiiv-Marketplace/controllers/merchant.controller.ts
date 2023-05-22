import express from 'express'

import { getMerchantById } from '../../model/merchant'

export const getMerchant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;

        const merchant = await getMerchantById(id);
        return res.status(200).json({ success: true, merchant })
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

// export const updateMerchant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     try {
//         const { id } = req.params;

//         // TODO: What can Merchants Update
//         // const { username } = req.body;

//         // if (!username) {
//         //     return res.sendStatus(400)
//         // }

//         const merchant = await getMerchantById(id);

//         merchant.username = username;
//         await merchant.save();
//         return res.status(200).json({ success: true, merchant })

//     } catch (error) {
//         console.log(error);
//         return res.sendStatus(400)
//     }
// }