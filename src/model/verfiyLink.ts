import mongoose from "mongoose";

const verifyLink = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    verified: { type: Boolean, default: false },
    referrerUsername: { type: String },
});

export const VerifyLinkModel = mongoose.model('VerifyLink', verifyLink);

export const getVerfiyTokenByEmail = (email: string) => VerifyLinkModel.findOne({ email });
export const createVerifyToken = (values: Record<string, any>) => new VerifyLinkModel(values)
    .save().then((verifyToken) => verifyToken.toObject());
export const updateVerifyTokenByEmail = (email: string, values: Record<string, any>) => VerifyLinkModel.findOneAndUpdate({ email }, values);
