const mongoose = require("mongoose");

const trafficLightSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ["red", "yellow", "green"],
    default: "red",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TrafficLight", trafficLightSchema);