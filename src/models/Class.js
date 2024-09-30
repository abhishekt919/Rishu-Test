// models/Class.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Class name is required'],
    },
    description: {
        type: String,
    },
});

module.exports = mongoose.model('Class', ClassSchema);
