const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MachineSchema = new Schema({
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    machineType: {
        type: Schema.Types.ObjectId,
        ref: 'MachineType',
        index: true
    },
    machineStatus: { type: Number, default: 0 }, // 0 Offline, 1 Online
    cabinetSerialNumber: String,
    programSerialNumber: { type: String, index: true },
    machineIP: String,
    sentry: Boolean,
    atm: Boolean,
    tito: Boolean,
    locationName: String,
    locationAddress: Object,
    locationManager: Object,
    createdBy: {
        type: Schema.Types.ObjectId,
        index: true,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        index: true,
        ref: 'User'
    },
    verifiedBy: {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: 'Admin'
        },
        datetime: Date
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const MachineObj = mongoose.model('Machine', MachineSchema);
module.exports = MachineObj;