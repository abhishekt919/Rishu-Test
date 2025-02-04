const Booking = require("../models/Booking");
const Event = require("../models/Events");
const {sendBookingConfirmation} = require("../helpers/helperFunctions")
const {sendEmail} = require("../helpers/helperFunctions")

exports.bookTickets = async (req, res) => {
  const { to, userId, eventId, seats, userEmail } = req.body;

  try {
    // Find the event and check seat availability
    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < seats) {
      return res.status(400).json({ error: "Insufficient seats available" });
    }

    // Calculate total price and create a booking
    const totalPrice = seats * event.price;
    const booking = new Booking({
      user: userId,
      event: eventId,
      seats,
      totalPrice,
    });
    await booking.save();

    // Update available seats for the event
    event.availableSeats -= seats;
    await event.save();

    // Prepare email data for the HTML template
    const subject = 'Booking Confirmation';
    const templateName = 'emailTemplate'; // Name of your template (without the .hbs extension)
    const context = {
      subject,
      eventTitle: event.title,
      eventDate: event.date,
      seats,
      message: `Thank you for booking with us! Your booking has been confirmed.`,
    };

    // Send email using the template
    await sendEmail(userEmail, subject, templateName, context);

    // Send SMS confirmation using your SMS helper function
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
