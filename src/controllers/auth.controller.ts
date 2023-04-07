import express from "express"
import jwt from "jsonwebtoken";
import { AuthValidator } from "../validators";

import { getUserByEmail, createUser, getUserByUsername } from "../model/users";
import { authentication, comparePassword } from "../helpers";

const baseUrl = process.env.BASE_URL as string;
const secretKey = process.env.TOKEN_SECRET as string;
const saltRounds = parseInt(process.env.SALT_ROUNDS as string);
const regirstrationReward = parseInt(process.env.REGISTRATION_REWARD as string);
const rewardPerReferral = parseInt(process.env.REWARD_PER_REFERAL as string);




export const register = async (req: express.Request, res: express.Response) => {
    const { fullname, username, email, password, referrerUsername } = req.body;
    const { error, value } = await AuthValidator.validateRegister(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const exisitingUser = await getUserByEmail(email);

        if (exisitingUser) {
            return res.status(400).json({ success: false, message: "Email already exist" });
        }

        const referrer = await getUserByUsername(referrerUsername);

        if (!referrer) {
            return res.status(400).json({ success: false, message: "Referrer Does not exist" });
        }

        const user = await createUser({
            email,
            fullname,
            username,
            authentication: {
                password: await authentication(password),
            },
            referrer: referrerUsername,
            referalLink: `${baseUrl}/register/${username}`,
            tokenReward: regirstrationReward
        });

        referrer.referrals.push(username);
        referrer.tokenReward = referrer.tokenReward + rewardPerReferral;
        referrer.save();

        return res.status(201).json({ success: true, user });

    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
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
            return res.status(403).json({ success: true, message: "incorrect password" })
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

// export const referedRegistration = async (req: express.Request, res: express.Response) => {
//     const { fullname, username, email, password } = req.body;
//     const { referrerUsername } = req.params
//     const { error, value } = await AuthValidator.validateRegister(req.body);
//     if (error) {
//         return res.status(400).send({
//             success: false,
//             message: error.details[0].message,
//         });
//     }
//     try {
//         const exisitingUser = await getUserByEmail(email);

//         if (exisitingUser) {
//             return res.status(400).json({ success: false, message: "Email already exist" });
//         }
//         const user = await createUser({
//             email,
//             fullname,
//             username,
//             authentication: {
//                 password: await authentication(password),
//             },
//             referrer: referrerUsername,
//             referalLink: `${baseUrl}/register/${username}`
//         });

//         const referrer = await getUserByUsername(referrerUsername);
//         referrer.referrals.push(username);
//         referrer.tokenReward = referrer.tokenReward + rewardPerReferral;
//         referrer.save();

//         return res.status(201).json({ success: true, user });

//     } catch (error) {
//         console.log(error);
//         return res.sendStatus(400);
//     }
// }