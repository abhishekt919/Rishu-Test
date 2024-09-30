const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: String,
    email: String,
    phone: String,
    countryCode: String,
    dotNumber: String,
    website: String,
    currency: String,
    referralCode: String, // Other Company Referral Code
    affiliateCode: String, // Company affiliate Code
    sameAsBillingAddress: { type: Boolean, default: false },
    billingAddress: Object,
    shippingAddress: Object,
    timezone: String,
    logo: Object,
    customerId: String, // Stripe Account Id
    machineTypes: [{
        type: Schema.Types.ObjectId,
        ref: 'MachineType'
    }],
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
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const CompanyObj = mongoose.model('Company', CompanySchema);
module.exports = CompanyObj;