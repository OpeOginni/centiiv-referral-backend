import mongoose from 'mongoose';

const MerchantSchema = new mongoose.Schema({
    merchantName: { type: String, required: true },
    buisnessName: { type: String, required: true },
    email: { type: String, required: true },
    authentication: {
        password: { type: String, required: true, select: false },
        sessionToken: { type: String, select: false },
    },
    // country: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    category: { type: String, required: true },
});

export const MerchantModel = mongoose.model('Merchant', MerchantSchema);

export const getMerchants = () => MerchantModel.find();
export const getMerchantByEmail = (email: string) => MerchantModel.findOne({ email });
export const getMerchantByBuisnessName = (buisnessName: string) => MerchantModel.findOne({ buisnessName });
export const getMerchantBySessionToken = (sessionToken: string) => MerchantModel.findOne({
    'authentication.sessionToken': sessionToken,
});
export const getMerchantById = (id: string) => MerchantModel.findById(id);
export const createMerchant = (values: Record<string, any>) => new MerchantModel(values)
    .save().then((merchant) => merchant.toObject());
export const deleteMerchantById = (id: string) => MerchantModel.findOneAndDelete({ _id: id });
export const updateMerchantById = (id: string, values: Record<string, any>) => MerchantModel.findByIdAndUpdate(id, values);
export const getMerchantsByLocation = (location: string) => MerchantModel.find({ location })