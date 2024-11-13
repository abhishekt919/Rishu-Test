const mongoose = require("mongoose");

const trafficLightSchema = new mongoose.Schema({
  north: { type: String, default: "red" },
  south: { type: String, default: "red" },
  east: { type: String, default: "red" },
  west: { type: String, default: "red" }
});

const TrafficLight = mongoose.model("TrafficLight", trafficLightSchema);

module.exports = TrafficLight;
