const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

exports.calculateDays = (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required." });
  }

  const start = dayjs(startDate, "YYYY-MM-DD", true);
  const end = dayjs(endDate, "YYYY-MM-DD", true);

  // Validate the dates
  if (!start.isValid() || !end.isValid()) {
    return res.jsonp({
      messageId: 400,
      error: "Invalid date format. Please use YYYY-MM-DD format.",
    });
  }

  // Check if the end date is before the start date
  if (end.isBefore(start)) {
    return res.jsonp({
      messageId: 400,
      error: "End date must be after start date.",
    });
  }

  // Calculate the difference in days
  const diffInDays = end.diff(start, "day");
  return res.jsonp({ messageId: 200, status: "Success", days: diffInDays });
};
