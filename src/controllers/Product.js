const axios = require("axios");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const constantObj = require("../config/Constants");
const ProductObj = require("../models/Product");
const { errorHandler } = require("../helpers/helperFunctions");

exports.AddProduct = async (req, res) => {
  try {
    const { _id, quantity } = req.body;

    if (_id) {
      // Update existing product
      const updatedProduct = await ProductObj.updateOne(
        { _id },
        { $set: req.body }
      );
      if (!updatedProduct) throw new Error("Failed to update product");

      return res.jsonp({
        status: "success",
        messageId: 200,
        message: "Product " + constantObj.messages.RecordUpdated,
      });
    } else {
      // Add new product
      const newProduct = new ProductObj(req.body);
      newProduct.quantity = 10;
      newProduct.isAvailable = true;
      await newProduct.save();
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.ProductAdded,
      });
    }
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

exports.GetAllProduct = (req, res) => {
  ProductObj.find()
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData,
        });
      }

      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

exports.GetProductById = (req, res) => {
  ProductObj.findOne({ _id: req.params.id })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

exports.AddInStock = (req, res) => {
  ProductObj.updateOne(
    { _id: req.params.id },
    { $set: { isAvailable: true, quantity: 10 } },
    function (err, response) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: "Product " + constantObj.messages.RecordUpdated,
      });
    }
  );
};

exports.OutOfStock = (req, res) => {
  ProductObj.updateOne(
    { _id: req.params.id },
    { $set: { isAvailable: false, quantity: 0 } },
    function (err, response) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: "Product " + constantObj.messages.RecordUpdated,
      });
    }
  );
};

// Update Product By Id
exports.UpdateById = (req, res) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).jsonp({
      status: "error",
      messageId: 400,
      message: "Invalid product ID format",
    });
  }

  ProductObj.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(productId) },
    { $set: req.body },
    { new: true },
    (err, updatedProduct) => {
      if (err) {
        return res.status(500).jsonp(errorHandler(err.message));
      }

      if (!updatedProduct) {
        return res.status(404).jsonp({
          status: "error",
          messageId: 404,
          message: "Product record not found",
        });
      }

      return res.status(200).jsonp({
        status: "success",
        messageId: 200,
        message: "Product " + constantObj.messages.RecordUpdated,
        data: updatedProduct,
      });
    }
  );
};
