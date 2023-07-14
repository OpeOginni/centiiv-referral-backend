import express from "express"
import jwt from "jsonwebtoken";
import { AuthValidator } from "../validators";
import { sendEmailTemplate } from "../services/sendgrid";

import { getVerfiyTokenByEmail, createVerifyToken, updateVerifyTokenByEmail } from "../model/verfiyLink";
import { getUserByEmail, createUser, getUserByUsername } from "../model/users";
import { authentication, comparePassword } from "../helpers";

const baseUrl = process.env.BASE_URL as string;
const secretKey = process.env.TOKEN_SECRET as string;
const saltRounds = parseInt(process.env.SALT_ROUNDS as string);
const regirstrationReward = parseInt(process.env.REGISTRATION_REWARD as string);
const rewardPerReferral = parseInt(process.env.REWARD_PER_REFERAL as string);
const WelcomeTemplateEmail = process.env.WELCOME_TEMPLATE_ID as string;
const VerifyRegistrationTemplateEmail = process.env.VERIFY_REGISTRATION_TEMPLATE_ID as string;

export const verifySignUp = async (req: express.Request, res: express.Response) => {
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
            const username = decodedToken.username;
            const fullname = decodedToken.fullname;
            const referrerUsername = decodedToken.referrer;

            if (referrerUsername === 'none') {
                const user = await createUser({
                    email,
                    fullname,
                    username,
                    authentication: {
                        password: password, // What is passed is already decoded
                    },
                    referalLink: `${baseUrl}/register/${username}`,
                    tokenReward: regirstrationReward
                });

                const emailData = {
                    to: email,
                    subject: subject,
                    templateId: WelcomeTemplateEmail,
                    dynamic_template_data: {
                        email: email,
                    },
                };

                await sendEmailTemplate(emailData);

                return res.status(200).json({ success: true, user });

            } else {

                const referrer = await getUserByUsername(referrerUsername);
                if (!referrer) {
                    return res.status(400).json({ success: false, message: "Referrer does not exist" });
                }

                referrer.referrals.push(username);
                referrer.tokenReward = referrer.tokenReward + rewardPerReferral;
                referrer.save();

                const user = await createUser({
                    email,
                    fullname,
                    username,
                    authentication: {
                        password: password, // What is passed is already decoded
                    },
                    referrerUsername: referrerUsername,
                    referalLink: `${baseUrl}/register/${username}`,
                    tokenReward: regirstrationReward
                });

                const emailData = {
                    to: email,
                    subject: subject,
                    templateId: WelcomeTemplateEmail,
                    dynamic_template_data: {
                        email: email,
                    },
                };

                await sendEmailTemplate(emailData);

                return res.status(200).json({ success: true, user });

            }
        }


    } catch (error) {
        console.log(error)

        if (error instanceof jwt.TokenExpiredError) {
            // JWT has expired
            const errorMessage = 'Token has expired';
            return res.status(400).json({ error: errorMessage });
        }
        return res.sendStatus(500).json({ error: 'Verification Failed' });
    }
}



export const login = async (req: express.Request, res: express.Response) => {
    const failedResponse = {
        success: false,
        message: "Invalid Email Address or Password",
    };
    const { email, password } = req.body;

    try {

        const { error, value } = await AuthValidator.validateLogin(req.body);
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

        if (user.restricted === true) {
            return res.status(400).json({
                success: false,
                message: "Account is restricted",
            });
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
        return res.sendStatus(400);
    }
}

export const register = async (req: express.Request, res: express.Response) => {

    const subject = "Account Created";
    const { fullname, username, email, password } = req.body;
    const { error, value } = await AuthValidator.validateRegister(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const userPassword = await authentication(password)
        const exisitingUser = await getUserByEmail(email);

        if (exisitingUser) {
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
                        { fullname: fullname, username: username, email: email, password: userPassword, referrer: 'none' },
                        secretKey,
                        { expiresIn: "1800 seconds" } // 30 MINS
                    );

                    const verifyTokenObject = await updateVerifyTokenByEmail(
                        email,
                        {
                            token: verifyToken,
                        })
                    const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

                    // Send Verify Token too
                    const emailData = {
                        to: email,
                        subject: subject,
                        templateId: VerifyRegistrationTemplateEmail,
                        dynamic_template_data: {
                            email: email,
                            verification_link: verifyEmailLink
                        },
                    };
                    await sendEmailTemplate(emailData);

                    return res.status(201).json({ success: true, message: "Verification Email Resent" });
                }
            }
        }

        const verifyToken = jwt.sign(
            { fullname: fullname, username: username, email: email, password: userPassword, referrer: 'none' },
            secretKey,
            { expiresIn: "1800 seconds" } // 30 MINS
        );

        const verifyTokenObject = await createVerifyToken({
            email: email,
            token: verifyToken,
        })
        const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

        // Send Verify Token too
        const emailData = {
            to: email,
            subject: subject,
            templateId: VerifyRegistrationTemplateEmail,
            dynamic_template_data: {
                email: email,
                verification_link: verifyEmailLink
            },
        };


        await sendEmailTemplate(emailData);

        return res.status(201).json({ success: true, message: "Email Sent" });

    } catch (error) {
        return res.sendStatus(400);
    }
}

export const referedRegistration = async (req: express.Request, res: express.Response) => {
    const subject = "Account Created";
    const { fullname, username, email, password, referrerUsername } = req.body;
    const { error, value } = await AuthValidator.validateRefRegistration(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }

    if (referrerUsername == "") {
        const subject = "Account Created";
        const { fullname, username, email, password } = req.body;
        const { error, value } = await AuthValidator.validateRegister(req.body);
        if (error) {
            return res.status(400).send({
                success: false,
                message: error.details[0].message,
            });
        }
        try {
            const userPassword = await authentication(password)
            const exisitingUser = await getUserByEmail(email);

            if (exisitingUser) {
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
                            { fullname: fullname, username: username, email: email, password: userPassword, referrer: 'none' },
                            secretKey,
                            { expiresIn: "1800 seconds" } // 30 MINS
                        );

                        const verifyTokenObject = await updateVerifyTokenByEmail(
                            email,
                            {
                                token: verifyToken,
                            })
                        const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

                        // Send Verify Token too
                        const emailData = {
                            to: email,
                            subject: subject,
                            templateId: VerifyRegistrationTemplateEmail,
                            dynamic_template_data: {
                                email: email,
                                verification_link: verifyEmailLink
                            },
                        };
                        await sendEmailTemplate(emailData);

                        return res.status(201).json({ success: true, message: "Verification Email Resent" });
                    }
                }
            }

            const verifyToken = jwt.sign(
                { fullname: fullname, username: username, email: email, password: userPassword, referrer: 'none' },
                secretKey,
                { expiresIn: "1800 seconds" } // 30 MINS
            );

            const verifyTokenObject = await createVerifyToken({
                email: email,
                token: verifyToken,
            })
            const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

            // Send Verify Token too
            const emailData = {
                to: email,
                subject: subject,
                templateId: VerifyRegistrationTemplateEmail,
                dynamic_template_data: {
                    email: email,
                    verification_link: verifyEmailLink
                },
            };


            await sendEmailTemplate(emailData);

            return res.status(201).json({ success: true, message: "Email Sent" });

        } catch (error) {
            return res.sendStatus(400);
        }
    }
    try {
        const userPassword = await authentication(password)
        const exisitingUser = await getUserByEmail(email);

        if (exisitingUser) {
            return res.status(400).json({ success: false, message: "Email already exist" });
        }

        const existingVerificationLink = await getVerfiyTokenByEmail(email);

        if (existingVerificationLink) {
            try {
                const decodedToken = jwt.verify(existingVerificationLink.token, secretKey);

                return res.status(400).json({ success: true, message: "Check Your Email for the Verification Mail" });

            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    // Token has expired

                    const verifyToken = jwt.sign(
                        { fullname: fullname, username: username, email: email, password: userPassword, referrer: referrerUsername },
                        secretKey,
                        { expiresIn: "1800 seconds" } // 30 MINS
                    );

                    const verifyTokenObject = await updateVerifyTokenByEmail(
                        email,
                        {
                            token: verifyToken,
                        })
                    const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

                    // Send Verify Token too
                    const emailData = {
                        to: email,
                        subject: subject,
                        templateId: VerifyRegistrationTemplateEmail,
                        dynamic_template_data: {
                            email: email,
                            verification_link: verifyEmailLink
                        },
                    };
                    await sendEmailTemplate(emailData);

                    return res.status(201).json({ success: true, message: "Verification Email Resent" });
                }
            }
        }

        const verifyToken = jwt.sign(
            { fullname: fullname, username: username, email: email, password: userPassword, referrer: referrerUsername },
            secretKey,
            { expiresIn: "1800 seconds" } // 30 MINS
        );

        const verifyTokenObject = await createVerifyToken({
            email: email,
            token: verifyToken,
        })
        const verifyEmailLink = `${baseUrl}/verify/${verifyTokenObject.email}/${verifyTokenObject.token}`

        // Send Verify Token too
        const emailData = {
            to: email,
            subject: subject,
            templateId: VerifyRegistrationTemplateEmail,
            dynamic_template_data: {
                email: email,
                verification_link: verifyEmailLink
            },
        };


        await sendEmailTemplate(emailData);

        return res.status(201).json({ success: true, message: "Email Sent" });

    } catch (error) {
        return res.sendStatus(400);
    }
}