const Event = require('../models/Events');

exports.createEvent = async (req, res) => {
  const { title, date, time, venue, totalSeats, price } = req.body;
  try {
    const event = new Event({ title, date, time, venue, totalSeats, availableSeats: totalSeats, price });
    await event.save();
    res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
