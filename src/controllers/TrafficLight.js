// controllers/trafficLightController.js
const TrafficLight = require("../models/trafficLight");

// Get traffic light state
exports.getTrafficLightState = async (req, res) => {
  try {
    let trafficLight = await TrafficLight.findOne({});
    
    // If no document exists, create a default one
    if (!trafficLight) {
      trafficLight = new TrafficLight({ state: "red" });
      await trafficLight.save();
    }

    res.json(trafficLight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update traffic light state
exports.updateTrafficLightState = async (req, res) => {
  const { state } = req.body;
  try {
    const trafficLight = await TrafficLight.findOneAndUpdate(
      {},
      { state, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.json(trafficLight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
