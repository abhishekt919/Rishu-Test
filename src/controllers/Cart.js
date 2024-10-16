const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const ProductObj = require("../models/Product");
const User = require("../models/User");

// Add item to cart
exports.addItemToCart = async (req, res) => {
  const { productId, quantity, userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "User not found",
      });
    }

    const product = await ProductObj.findById(productId);
    if (!product) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "Product not found",
      });
    }

    // Find or create a cart for the user
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    // Check if sufficient quantity is available
    if (product.quantity < quantity) {
      return res.jsonp({
        status: "error",
        messageId: 400,
        message: "Insufficient product quantity",
      });
    }

    product.quantity -= quantity;
    product.isAvailable = product.quantity > 0;
    await product.save();

    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      // Update the quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    // Save the cart
    await cart.save();
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "Internal Server Error",
    });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  const { id } = req.body;
  try {
    const cart = await Cart.findOne(id).populate("items.productId");
    if (!cart) {
      return res.jsonp({
        status: "success",
        message: "Cart is empty",
        cart: [],
      });
    }
    return res.jsonp({
      status: "success",
      messageId: 200,
      data: cart,
      message: "Cart Data.",
    });
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "Internal Server Error",
    });
  }
};

// Update or remove item from cart
exports.updateOrRemoveItemFromCart = async (req, res) => {
  const { productId, quantity, userId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item from the cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Otherwise, update the quantity of the item
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "Internal Server Error",
    });
  }
};

// Remove item from cart
exports.RemoveItemFromCart = async (req, res) => {
  const { productId, userId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.jsonp({
        status: "error",
        messageId: 404,
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.jsonp({
      status: "success",
      messageId: 200,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "Internal Server Error",
    });
  }
};
