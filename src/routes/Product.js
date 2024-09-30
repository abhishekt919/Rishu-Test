const express = require("express");
const router = express.Router();

const ProductCtrl = require("../controllers/Product");

router.post("/create", ProductCtrl.AddProduct);
router.get("/get", ProductCtrl.GetAllProduct);
router.get("/get/:id", ProductCtrl.GetProductById);
//Edit Product Details
router.put("/update-product/:id", ProductCtrl.UpdateById);

//set in stock
router.patch("/add-in-stock/:id", ProductCtrl.AddInStock);
// set out of stock
router.patch("/out-of-stock/:id", ProductCtrl.OutOfStock);

module.exports = router;