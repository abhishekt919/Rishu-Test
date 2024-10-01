const express = require("express");
const router = express.Router();
const NewProductCtrl = require("../controllers/newProduct");

router.get("/get-all", NewProductCtrl.GetAllProduct);
router.post("/add", NewProductCtrl.AddProduct);
router.put("/update/:id", NewProductCtrl.UpdateProduct);
router.delete("/delete/:id", NewProductCtrl.DeleteProduct);

module.exports = router;
