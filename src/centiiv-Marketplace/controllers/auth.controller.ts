import express from "express"
import jwt from "jsonwebtoken";
import { AuthValidator } from "../validators";
import { sendEmailTemplate } from "../../services/sendgrid";

import { getVerfiyTokenByEmail, createVerifyToken, updateVerifyTokenByEmail } from "../../model/verifyLink";
import { createMerchant, getMerchantByEmail } from "../../model/merchant";
import { getUserByEmail } from "../../model/users";

import { authentication, comparePassword } from "../../helpers";

const baseUrl = process.env.BASE_URL as string;
const secretKey = process.env.TOKEN_SECRET as string;
const WelcomeTemplateEmail = process.env.WELCOME_TEMPLATE_ID as string;
const VerifyRegistrationTemplateEmail = process.env.VERIFY_REGISTRATION_TEMPLATE_ID as string;

export const verifyMerchantSignUp = async (req: express.Request, res: express.Response) => {
    const subject = "Account Created";

    try {
        const { email, token } = req.params;

        const userVerifyTokenObject = await getVerfiyTokenByEmail(email);
        if (!userVerifyTokenObject) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
        if (userVerifyTokenObject.verified) {
            return res.status(400).json({ success: false, message: "Email already verified" });
        }

        if (token === userVerifyTokenObject.token) {

            // const decodedToken = jwt.decode(token, { complete: true });
            const decodedToken = jwt.verify(token, secretKey);


            // check if the token is valid
            // check if the token is valid and is a JwtPayload object
            if (typeof decodedToken === 'string') {
                return res.status(400).json({ success: false, message: "Invalid Token" });
            } else if (!('password' in decodedToken) || !('email' in decodedToken) || !('username' in decodedToken) || !('fullname' in decodedToken) || !('referrer' in decodedToken)) {
                return res.status(400).json({ success: false, message: "Invalid Token" });
            } else if (decodedToken.exp < Date.now() / 1000) {
                return res.status(400).json({ success: false, message: "Token expired" });
            }
            userVerifyTokenObject.verified = true;
            await userVerifyTokenObject.save();

            const password = decodedToken.password;
            const email = decodedToken.email;
            const merchantName = decodedToken.merchantName;
            const buisnessName = decodedToken.buisnessName;
            const mobileNumber = decodedToken.mobileNumber;
            const description = decodedToken.description;
            const location = decodedToken.location;
            const category = decodedToken.category;

            const merchant = await createMerchant({
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

            //TODO: WELCOME MAIL FOR MERCHANTS
            // const emailData = {
            //     to: email,
            //     subject: subject,
            //     templateId: WelcomeTemplateEmail,
            //     dynamic_template_data: {
            //         buisnessName: merchant.buisnessName,
            //         email: merchant.email,
            //     },
            // };

            // sendEmailTemplate(emailData);

            return res.status(201).json({ success: true, merchant });
        }
    }
    catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            // JWT has expired
            const errorMessage = 'Token has expired';
            return res.status(400).json({ error: errorMessage });
        }
        return res.sendStatus(500).json({ error: 'Verification Failed' });
    }
}

export const registerMerchant = async (req: express.Request, res: express.Response) => {

    const subject = "Account Created";
    const { merchantName, buisnessName, email, password, mobileNumber, description, location, category } = req.body;
    const { error, value } = await AuthValidator.validateMerchantRegistration(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const merchantPassword = await authentication(password)
        const exisitingMerchant = await getMerchantByEmail(email);

        if (exisitingMerchant) {
            return res.status(400).json({ success: false, message: "Email already exist" });
        }

        const existingVerificationLink = await getVerfiyTokenByEmail(email);

        if (existingVerificationLink) {
            try {
                const decodedToken = jwt.verify(existingVerificationLink.token, secretKey);

                return res.status(400).json({ success: true, message: "Click on link in Registration Email" });

            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    // Token has expired

                    const verifyToken = jwt.sign(
                        { merchantName: merchantName, buisnessName: buisnessName, email: email, password: merchantPassword, mobileNumber: mobileNumber, description: description, location: location, category: category },
                        secretKey,
                        { expiresIn: "1800 seconds" } // 30 MINS
                    );

                    const verifyTokenObject = await updateVerifyTokenByEmail(
                        email,
                        {
                            token: verifyToken,
                        })
                    const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

                    // TODO: FOR MERCHANTS TO VERIFY THEIR ACCOUNT

                    // Send Verify Token too
                    // const emailData = {
                    //     to: email,
                    //     subject: subject,
                    //     templateId: VerifyRegistrationTemplateEmail,
                    //     dynamic_template_data: {
                    //         email: email,
                    //         verification_link: verifyEmailLink
                    //     },
                    // };

                    // await sendEmailTemplate(emailData);
                    console.log(verifyToken)

                    return res.status(201).json({ success: true, message: "Verification Email Resent" });
                }
            }
        }

        const verifyToken = jwt.sign(
            { merchantName: merchantName, buisnessName: buisnessName, email: email, password: merchantPassword, mobileNumber: mobileNumber, description: description, location: location, category: category },
            secretKey,
            { expiresIn: "1800 seconds" } // 30 MINS
        );

        const verifyTokenObject = await createVerifyToken({
            email: email,
            token: verifyToken,
        })
        const verifyEmailLink = `${baseUrl}/merchant/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

        console.log(verifyToken)

        // TODO: FOR MERCHANTS TO VERIFY THEIR ACCOUNT

        // Send Verify Token too
        // const emailData = {
        //     to: email,
        //     subject: subject,
        //     templateId: VerifyRegistrationTemplateEmail,
        //     dynamic_template_data: {
        //         email: email,
        //         verification_link: verifyEmailLink
        //     },
        // };

        // await sendEmailTemplate(emailData);

        return res.status(201).json({ success: true, message: "Email Sent" });

    } catch (error) {
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