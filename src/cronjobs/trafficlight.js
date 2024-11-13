// cron/trafficLightCron.js
const cron = require("node-cron");
const TrafficLight = require("../models/trafficLight");
const directions = ["north", "south", "east", "west"];
let currentIndex = 0;

const startTrafficLightCron = () => {
  cron.schedule("*/15 * * * * *", async () => {
    try {
      // Prepare the new state with all directions red by default
      const newState = {
        north: "red",
        south: "red",
        east: "red",
        west: "red"
      };

      // Turn green only the current direction in the sequence
      newState[directions[currentIndex]] = "green";

      // Update the database with the new state
      await TrafficLight.findOneAndUpdate({}, newState, { new: true, upsert: true });

      console.log(`Traffic light updated: ${directions[currentIndex]} is green`);

      // Move to the next direction in the sequence
      currentIndex = (currentIndex + 1) % directions.length;
    } catch (error) {
      console.error("Error updating traffic light:", error);
    }
  });
};

module.exports = startTrafficLightCron;
