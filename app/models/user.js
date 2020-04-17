const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
const { Roles, Status } = require('../enums');
const { address } = require('../middleware/db');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true }, // First Name of the User
    lastName: { type: String, required: true }, // Last Name of the User
    email: {
      type: String,
      validate: { validator: validator.isEmail, message: 'EMAIL_IS_NOT_VALID' },
      lowercase: true,
      required: true
    }, // Email Address of the User
    isEmailVerified: { type: Boolean, default: false }, // Either Email is verified or not
    password: { type: String, required: true }, // Password of the User's Account
    countryCode: String, // Country Code of User's Phone Number
    phoneNumber: String, // User's Phone Number
    profilePicture: String, // User's Profile Picture File Name
    role: { type: String, enum: Object.values(Roles) }, // User's Role customer, tech, admin etc
    companyName: String, // Company Name as entered by the provider at the signup time
    companyAddress: address /* Common address Object Defined in db.js */, // Company Address as entered by the provider at the signup time
    stripeCustomerId: String, // Stripe Customer Id Used for the Customers for the credit cards and payment deductions
    stripeConnectedAccountId: String, // Stripe Connect Account Id Used for the Providers for the bank accounts and payment transfer
    serviceAreas: [{ type: Schema.Types.ObjectId, ref: 'ServiceArea' }], // Service Areas where user will work (for tech and providers)
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }], // Categories in which provider will work
    designerEmail: {
      type: String,
      validate: { validator: validator.isEmail, message: 'DESIGNER_EMAIL_IS_NOT_VALID' },
      lowercase: true
    }, // Future Purpose if tech want it own designer
    buyerEmail: {
      type: String,
      validate: { validator: validator.isEmail, message: 'BUYER_EMAIL_IS_NOT_VALID' },
      lowercase: true
    }, // Future Purpose if tech want it own buyer
    emailConfirmationCode: String, // Email Confirmation Code to Verify Email Address
    emailConfirmationCodeExpiry: Date, // Email Confirmation Code Expiry when requested to Verify Email Address
    isVerified: Boolean, // Is User Verified - Future Use
    loginAttempts: { type: Number, default: 0 }, // Login Attempts by the User
    blockExpires: { type: Date, default: Date.now }, // Temporary Block Account after too many attempts
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' }, // This would be used in the future for cloud SAAS
    enableNotifications: { type: Boolean, default: true }, // Is Notification Enable or not - Future Use
    bidAcceptanceNotification: { type: Boolean, default: true }, // Is Bid Acceptance Notification Enable or not - Future Use
    projectUpdates: { type: Boolean, default: true }, // Is Project Updates Notification Enable or not
    jobCancellationNotification: { type: Boolean, default: true }, // Is Job Cancellation Notification Enable or not - Future Use
    socketId: String, // User's Socket Id
    accessToken: String, // JWT Access token that is required to authentication
    accessTokenExpiration: String, // JWT Access token expiry
    calendlyAppointmentUrl: String, // Future Use When Any Tech/Manager will set it own appointment URL
    calendlyApiKey: String, // Future Use When Any Tech/Manager will set it own calendly account
    status: { type: String, enum: Object.values(Status) } // Status of the User active, inactive, blocked etc
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, null, (error, newHash) => {
    if (error) {
      return next(error);
    }
    user.password = newHash;
    return next();
  });
};

const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    return hash(user, salt, next);
  });
};

UserSchema.pre('save', function(next) {
  const that = this;
  const SALT_FACTOR = 5;
  if (!that.isModified('password')) {
    return next();
  }
  return genSalt(that, SALT_FACTOR, next);
});

UserSchema.pre('update', function(next) {
  // var user = this.getUpdate().$set.password
  const user = this.getUpdate();
  bcrypt.genSalt(5, (err, salt) => {
    if (err) {
      return next(err);
    }

    return bcrypt.hash(user.$set.password, salt, null, (error, newHash) => {
      if (error) {
        return false;
      }
      user.$set.password = newHash;
      this.update({}, { $set: { password: user.$set.password } });
      return next();
    });
  });
});

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  );
};

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('User', UserSchema);
