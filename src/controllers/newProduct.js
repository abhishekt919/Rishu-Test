const constantObj = require("../config/Constants");
const ProductObj = require("../models/newProduct");
const { errorHandler } = require("../helpers/helperFunctions");

exports.GetAllProduct = (req, res) => {
  ProductObj.find()
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(constantObj.messages.ErrorRetrievingData));
      }

      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

const generateAlphanumericID = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.AddProduct = async (req, res) => {
  try {
    const newProductId = await checkProductId();
    const newProduct = new ProductObj(req.body);
    // Assign the unique productId
    newProduct.productId = newProductId;

    await newProduct.save();
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.ProductAdded,
      data: newProduct,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

async function checkProductId() {
  const newProductId = generateAlphanumericID(10);

  // Check if the generated product ID already exists
  const checkExistingProductId = await ProductObj.findOne(
    { productId: newProductId },
    { _id: 1 }
  )
    .lean()
    .exec();

  // If it exists, call checkProductId recursively
  if (checkExistingProductId) {
    return checkProductId();
  }

  // If it doesn't exist, return the new product ID
  return newProductId;
}

exports.UpdateProduct = async (req, res) => {
  try {
    const { quantity } = req.body;

    const updatedFields = { ...req.body };

    if (quantity === 0) {
      updatedFields.status = "unavailable";
    } else if (quantity > 0 && quantity <= 5) {
      updatedFields.status = "low stock";
    } else {
      updatedFields.status = "available";
    }

    const updatedProduct = await ProductObj.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedProduct) throw new Error("Failed to update product");

    return res.jsonp({
      status: "success",
      messageId: 200,
      message: "Product has been updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// Function to handle deleting a product by ID
exports.DeleteProduct = async (req, res) => {
  try {
    // Find the product by ID and delete it
    const deletedProduct = await ProductObj.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.jsonp(errorHandler("Product not found"));
    }

    return res.jsonp({
      status: "success",
      messageId: 200,
      message: "Product successfully deleted",
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};
