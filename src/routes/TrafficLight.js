// routes/trafficLightRoutes.js
const express = require("express");
const router = express.Router();
const trafficLightController = require("../controllers/TrafficLight");

router.get("/", trafficLightController.getTrafficLightState);
router.patch("/", trafficLightController.updateTrafficLightState);

module.exports = router;
