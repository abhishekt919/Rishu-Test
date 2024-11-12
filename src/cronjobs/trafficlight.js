// cron/trafficLightCron.js
const cron = require("node-cron");
const TrafficLight = require("../models/trafficLight");

const trafficStates = ["red", "yellow", "green"];
let currentIndex = 0;

const startTrafficLightCron = () => {
  cron.schedule("*/15 * * * * *", async () => {
    try {
      currentIndex = (currentIndex + 1) % trafficStates.length;
      const newState = trafficStates[currentIndex];

      const updatedTrafficLight = await TrafficLight.findOneAndUpdate(
        {},
        { state: newState },
        { new: true, upsert: true }
      );

      console.log("Traffic light updated to:", updatedTrafficLight.state);
    } catch (error) {
      console.error("Error updating traffic light:", error);
    }
  });
};

module.exports = startTrafficLightCron;
