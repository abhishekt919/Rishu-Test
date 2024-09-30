const mongoose = require('mongoose');
const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, lowercase: true, trim: true },
  mobilePhone: { type: String, trim: true },
  username: { type: String, trim: true, required: true, index: true, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['director', 'manager', 'employee']
  },
  permissions: Array,
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  awsDirectory: String,
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  address: Object,
  profilePic: Object,
  timezone: String,
  gender: String,
  lastLoginEnabled: { type: Boolean, default: false },
  lastLogin: Array,
  isAccountOwner: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  notifications: {
    email: { type: Boolean, default: true },
    mobile: { type: Boolean, default: true },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
}, { timestamps: true });

UserSchema.plugin(mongooseIntlPhoneNumber, {
  hook: 'validate',
  phoneNumberField: 'mobilePhone',
  nationalFormatField: 'nationalFormat',
  internationalFormat: 'internationalFormat',
  countryCodeField: 'countryCode'
});

UserSchema.plugin(uniqueValidator);

const UserObj = mongoose.model('User', UserSchema);
module.exports = UserObj;
