const Booking = require("../models/Booking");
const Event = require("../models/Events");
const {sendBookingConfirmation} = require("../helpers/helperFunctions")
const {sendEmail} = require("../helpers/helperFunctions")

exports.bookTickets = async (req, res) => {
  const { to, userId, eventId, seats, userEmail } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < seats) {
      return res.status(400).json({ error: "Insufficient seats available" });
    }

    const totalPrice = seats * event.price;
    const booking = new Booking({
      user: userId,
      event: eventId,
      seats,
      totalPrice,
    });
    await booking.save();

    event.availableSeats -= seats;
    await event.save();
   const subject = 'Booking Confirmation';
    const text = `Your booking for the event "${event.title}" scheduled for ${event.date} has been confirmed. You have booked ${seats} seats.`;
    const html = `<p>Your booking for the event <strong>"${event.title}"</strong> scheduled for <strong>${event.date}</strong> has been confirmed.</p><p>You have booked <strong>${seats}</strong> seats.\nThank you!</p>`;

    await sendEmail(userEmail, subject, text, html);
    // Send SMS Confirmation using helper function
    await sendBookingConfirmation(to, event.title, event.date, seats);

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getUserBookings = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ user: userId }).populate("event");
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
