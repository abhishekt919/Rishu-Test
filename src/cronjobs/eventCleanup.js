const cron = require("node-cron");
const Event = require("../models/Events"); 

const deleteEvent = () => {
  cron.schedule("0 */5 * * *", async () => {
    try {
      const currentDate = new Date();
      const result = await Event.deleteMany({ date: { $lt: currentDate } });
      console.log(`${result.deletedCount} expired events deleted.`);
    } catch (error) {
      console.error("Error deleting expired events:", error);
    }
  });

  console.log("Cron job for deleting expired events is running...");
};

module.exports = deleteEvent;
