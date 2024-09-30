const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: String,
    title: String,
    price: Number,
    description: String,
    country: String,
    state: String,
    district: String,
    quantity: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: false }
},{ timestamps: true });

const ProductObj = mongoose.model('Product', ProductSchema);
module.exports = ProductObj;