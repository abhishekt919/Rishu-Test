const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const CartSchema = new Schema({
  items: [CartItemSchema], // Array of cart items
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
