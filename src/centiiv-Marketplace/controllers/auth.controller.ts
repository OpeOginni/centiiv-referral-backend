import express from "express"
import jwt from "jsonwebtoken";
import { AuthValidator } from "../validators";
import { sendEmailTemplate } from "../../services/sendgrid";


import { createMerchant, getMerchantByEmail } from "../../model/merchant";
import { getUserByEmail } from "../../model/users";

import { authentication, comparePassword } from "../../helpers";

const secretKey = process.env.TOKEN_SECRET as string;
const WelcomeTemplateEmail = process.env.WELCOME_TEMPLATE_ID as string;

export const registerMerchant = async (req: express.Request, res: express.Response) => {

    // const subject = "Account Created";
    const { merchantName, buisnessName, email, password, mobileNumber, description, location, category } = req.body;
    const { error, value } = await AuthValidator.validateMerchantRegistration(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const exisitingMerchant = await getMerchantByEmail(email);

        if (exisitingMerchant) {
            return res.status(400).json({ success: false, message: "Email already exist" });
        }
        const user = await createMerchant({
            email,
            merchantName,
            buisnessName,
            mobileNumber,
            location,
            category,
            authentication: {
                password: await authentication(password),
            },
            description
        });

        // Welcome Merchants 

        // const emailData = {
        //     to: email,
        //     subject: subject,
        //     templateId: WelcomeTemplateEmail,
        //     dynamic_template_data: {
        //         fullname: user.fullname,
        //         email: user.email,
        //     },
        // };

        // sendEmailTemplate(emailData);

        return res.status(201).json({ success: true, user });

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const loginUser = async (req: express.Request, res: express.Response) => {
    const failedResponse = {
        success: false,
        message: "Invalid Email Address or Password",
    };
    const { email, password } = req.body;

    try {

        const { error, value } = await AuthValidator.validateUserLogin(req.body);
        if (error) {
            return res.status(400).send({
                success: false,
                message: error.details[0].message,
            });
        }

        const user = await getUserByEmail(email).select('+authentication.password');

        if (!user) {
            return res.status(400).json(failedResponse)
        }

        if (!(await comparePassword(password, user.authentication.password))) {
            return res.status(400).json(failedResponse)
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email },
            secretKey,
            { expiresIn: "72000000 seconds" }
        );

        user.authentication.sessionToken = token;

        await user.save();
        res.cookie("jwt", token);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token,
            user: user,
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const loginMerchant = async (req: express.Request, res: express.Response) => {
    const failedResponse = {
        success: false,
        message: "Invalid Email Address or Password",
    };
    const { email, password } = req.body;

    try {

        const { error, value } = await AuthValidator.validateMerchantLogin(req.body);
        if (error) {
            return res.status(400).send({
                success: false,
                message: error.details[0].message,
            });
        }

        const merchant = await getMerchantByEmail(email).select('+authentication.password');

        if (!merchant) {
            return res.status(400).json(failedResponse)
        }

        if (!(await comparePassword(password, merchant.authentication.password))) {
            return res.status(400).json(failedResponse)
        }

        const token = jwt.sign(
            { _id: merchant._id, email: merchant.email },
            secretKey,
            { expiresIn: "72000000 seconds" }
        );

        merchant.authentication.sessionToken = token;

        await merchant.save();
        res.cookie("jwt", token);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token,
            merchant: merchant,
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}