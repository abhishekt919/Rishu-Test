// controllers/contact.js
const mongoose = require('mongoose');
const constantObj = require('../config/Constants');
const ContactObj = require('../models/Contact');
const { errorHandler } = require('../helpers/helperFunctions');
const upload = require('../middleware/upload'); // Import the Multer upload middleware

// Function to add or update a contact
exports.AddContact = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.jsonp({ status: 'failure', message: err.message });
    }

    // Save only the relative path of the image
    if (req.file) {
      req.body.image = req.file.filename; // Corrected to save relative path
    }

    try {
      if (req.body._id) {
        // Update existing contact logic
        await ContactObj.updateOne({ _id: req.body._id }, { $set: req.body });
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: constantObj.messages.ErrorRetrievingData,
        });
      } else {
        // Add new contact logic
        const newContact = new ContactObj(req.body);
        const result = await newContact.save();
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: constantObj.messages.RecordAdded,
          data: result,
        });
      }
    } catch (error) {
      res.jsonp({ status: 'failure', message: error.message });
    }
  });
};


// Function to get all contacts
exports.GetContact = (req, res) => {
  ContactObj.find()
    .sort({ name: 1 })
    .lean()
    .exec((err, data) => {
      if (err) {
        return res.jsonp({
          status: 'failure',
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData,
        });
      }
      return res.jsonp({
        status: 'success',
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

// Get Contact By ID
exports.GetContactById = (req, res) =>{
  ContactObj.findOne({ _id: req.params.id }).lean().exec((err, data)=>{
    if(err){
      return res.jsonp({
        status : 'failure',
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData,
      })
    }
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.SuccessRetreivingData,
      data: data

    })
  })
}
