const stripe = require('stripe')(process.env.StripeSecretKey);
const CustomerModel =  require("../models/Customer")
// Create customer.
const createCustomer = async (req, res) => {
  const { name, email } = req.body;
  try {
    const customer = await stripe.customers.create({
      name,
      email
    });
    const newCustomer = new CustomerModel({
      name: name,
      email: email,
      stripeCustomerId: customer.id,
    });
    await newCustomer.save();

    res.jsonp({
      status: 'success',
      messageId: 200,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.jsonp({
      status: 'error',
      messageId: 500,
      message: error.message
    });
  }
};


// Get all Customer.
const getAllCustomers = async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const customers = await stripe.customers.list({ limit: parseInt(limit) });
    res.jsonp({
      status: 'success',
      messageId: 200,
      message: 'Customers retrieved successfully',
      data: customers
    });
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.jsonp({
      status: 'error',
      messageId: 500,
      message: error.message
    });
  }
};


// Get customer by ID.
const getCustomerByID = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    res.jsonp({
      status: 'success',
      messageId: 200,
      message: 'Customer retrieved successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.jsonp({
      status: 'error',
      messageId: 500,
      message: error.message
    });
  }
};


// Update customer.
const updateCustomer = async (req, res) => {
  const { customerId } = req.params; 
  const { address } = req.body;

  try {
    const updatedCustomer = await stripe.customers.update(customerId, {
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country
      }
    });

    res.jsonp({
      status: 'success',
      messageId: 200,
      message: 'Customer address updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer address:', error);
    res.status(500).jsonp({
      status: 'error',
      messageId: 500,
      message: error.message
    });
  }
};



module.exports = { createCustomer, getAllCustomers, getCustomerByID, updateCustomer };
