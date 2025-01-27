// cron/trafficLightCron.js
const TrafficLight = require("../models/trafficLight");
const directions = ["north", "south", "east", "west"];
let currentIndex = 0; 

const startTrafficLightCron = () => {
  const updateTrafficLight = async () => {
    try {
      let greenState = {
        north: "red",
        south: "red",
        east: "red",
        west: "red"
      };
      greenState[directions[currentIndex]] = "green";

      await TrafficLight.findOneAndUpdate({}, greenState, { new: true, upsert: true });
      console.log(`Traffic light updated: ${directions[currentIndex]} is green`);

      setTimeout(async () => {
        let yellowState = {
          north: "red",
          south: "red",
          east: "red",
          west: "red"
        };
        yellowState[directions[currentIndex]] = "yellow";

        await TrafficLight.findOneAndUpdate({}, yellowState, { new: true, upsert: true });
        console.log(`Traffic light updated: ${directions[currentIndex]} is yellow`);

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % directions.length;
          updateTrafficLight();
        }, 5000);
      }, 15000);
    } catch (error) {
      console.error("Error updating traffic light:", error);
    }
  };

  updateTrafficLight();
};

module.exports = startTrafficLightCron;
