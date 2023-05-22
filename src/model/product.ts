import mongoose from 'mongoose';
import { MerchantModel } from './merchant';

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    productPrice: { type: Number, required: true },
    deliveryLocation: { type: String, required: true },
    productDescription: { type: String, required: true },
    productImages: { type: [String], default: [] },
    productSize: { type: Number, required: true },
});

ProductSchema.pre(/^find/, function (next) {
    // Whenever any find operations are made for a Card Object the Issuer attribute is poulated and the Name of the issuer is returned as a response
    this.populate({ path: 'merchant', select: 'buisnessName' });
    next();
});

export const ProductModel = mongoose.model('Product', ProductSchema);

export const getAllProducts = () => ProductModel.find();
export const getProductByMerchantId = (merchantId: string) => ProductModel.find({ merchant: merchantId });
export const getProductByProductName = (productName: string) => ProductModel.findOne({ productName });
export const getProductById = (id: string) => ProductModel.findById(id);

export const createProduct = (values: Record<string, any>) => new ProductModel(values)
    .save().then((Product) => Product.toObject());

export const deleteProductById = (id: string) => ProductModel.findOneAndDelete({ _id: id });
export const updateProductById = (id: string, values: Record<string, any>) => ProductModel.findByIdAndUpdate(id, values);
// export const deleteAllProducts = () => ProductModel.deleteMany({});