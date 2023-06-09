import express from "express"


export const healthCheck = async (req: express.Request, res: express.Response) => {
    try {
        return res.status(200).json({ 'success': true, });
    } catch (err) {
        console.log("Healtch Check Failed")

        console.log(err)
    }
}