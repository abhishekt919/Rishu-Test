const { upperCase } = require("lodash");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewProductSchema = new Schema(
  {
    productId: { type: String, index: true, unique: true, uppercase: true },
    title: String,
    price: Number,
    description: String,
    quantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "unavailable", "low stock", "deleted"], // define the 4 statuses
      required: true,
      default: "available", // or set any default status
    },
  },
  { timestamps: true }
);

const NewProductObj = mongoose.model("NewProduct", NewProductSchema);
module.exports = NewProductObj;
