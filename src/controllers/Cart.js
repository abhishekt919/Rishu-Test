const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const ProductObj = require("../models/Product");
const constantObj = require("../config/Constants");
const { errorHandler } = require("../helpers/helperFunctions");

exports.addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
  
    try {
      // Check if the product exists
      const product = await ProductObj.findById(productId);
      if (!product) {
        return res.status(404).jsonp({
          status: "error",
          message: "Product not found",
        });
      }
  
      // Find or create a single cart
      let cart = await Cart.findOne();
      if (!cart) {
        cart = new Cart({ items: [] });
      }
  
      // Check if sufficient quantity is available
      if (product.quantity < quantity) {
        return res.status(400).jsonp({
          status: "error",
          messageId: 400,
          message: "Insufficient product quantity",
        });
      }
  
      // Decrease the product quantity
      product.quantity -= quantity;
  
      // Update status to "Unavailable" if the quantity becomes 0
      if (product.quantity === 0) {
        product.isAvailable = false;
      }
  
      // Save the updated product
      await product.save();
  
      // Check if the product is already in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        // Update the quantity if the product is already in the cart
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add the new product to the cart
        cart.items.push({ productId, quantity });
      }
  
      // Save the cart
      await cart.save();
  
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: "Item added to cart",
        cart,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return res.status(500).jsonp({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
  

// Get Cart
exports.getCart = async (req, res) => {
  try {
      const cart = await Cart.findOne().populate('items.productId');
      if (!cart) {
          return res.jsonp({
              status: "success",
              message: "Cart is empty",
              cart: [],
          });
      }
      return res.jsonp({
          status: "success",
          cart,
      });
  } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).jsonp({
          status: "error",
          message: 'Internal Server Error',
      });
  }
};

// update
exports.updateOrRemoveItemFromCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne(); // Assuming there's only one cart or you need to find the cart based on a user or session.
        if (!cart) {
            return res.status(404).jsonp({
                status: "error",
                message: "Cart not found",
            });
        }

        // Check if the product exists in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).jsonp({
                status: "error",
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

        // Save the updated cart
        await cart.save();
        return res.jsonp({
            status: "success",
            message: "Cart updated successfully",
            cart,
        });

    } catch (error) {
        console.error('Error updating cart:', error);
        return res.status(500).jsonp({
            status: "error",
            message: 'Internal Server Error',
        });
    }
};

// delete
exports.RemoveItemFromCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne(); // Assuming there's only one cart or you need to find the cart based on a user or session.
        if (!cart) {
            return res.status(404).jsonp({
                status: "error",
                message: "Cart not found",
            });
        }

        // Check if the product exists in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).jsonp({
                status: "error",
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

        // Save the updated cart
        await cart.save();
        return res.jsonp({
            status: "success",
            message: "Cart updated successfully",
            cart,
        });

    } catch (error) {
        console.error('Error updating cart:', error);
        return res.status(500).jsonp({
            status: "error",
            message: 'Internal Server Error',
        });
    }
};


