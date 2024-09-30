const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MachineTypeSchema = new Schema({
    name: String,
    description: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        index: true,
        ref: 'Admin'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        index: true,
        ref: 'Admin'
    },
    topUpEnabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const MachineTypeObj = mongoose.model('MachineType', MachineTypeSchema);
module.exports = MachineTypeObj;