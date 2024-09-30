const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LegalSchema = new Schema({
    data: String,
    type: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
}, { timestamps: true });

const LegalObj = mongoose.model('Legal', LegalSchema);
module.exports = LegalObj;