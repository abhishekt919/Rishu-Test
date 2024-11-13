// controllers/trafficLightController.js
const TrafficLight = require("../models/trafficLight");

// Get traffic light state
exports.getTrafficLightState = async (req, res) => {
  try {
    let trafficLight = await TrafficLight.findOne({});

    // If no document exists, create a default one with states for each direction
    if (!trafficLight) {
      trafficLight = new TrafficLight({
        north: "red",
        south: "red",
        east: "red",
        west: "red"
      });
      await trafficLight.save();
    }

    // Respond with the traffic light states for each direction
    res.json({
      north: trafficLight.north,
      south: trafficLight.south,
      east: trafficLight.east,
      west: trafficLight.west
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTrafficLightState = async (req, res) => {
  const { north, south, east, west } = req.body; // Expecting states for each direction
  try {
    const trafficLight = await TrafficLight.findOneAndUpdate(
      {},
      { north, south, east, west, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.json(trafficLight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

