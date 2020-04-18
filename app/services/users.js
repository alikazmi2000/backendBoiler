const moment = require('moment');
const jwt = require('jsonwebtoken');
const mustache = require('mustache');
const User = require('../models/user');
const Otp = require('../models/otp');

const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { addMinutes } = require('date-fns');
const auth = require('../middleware/auth');
const { ErrorCodes, Roles, Status } = require('../enums');
const MINUTES_TO_BLOCK = process.env.LOGIN_ATTEMTS_MINUTES_TO_BLOCK;
const LOGIN_ATTEMPTS = process.env.ALLOWED_LOGIN_ATTEMPTS;

/*
 * ****************
 * Public Functions
 * ****************
 */
exports.emailExists = async (email, role = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user;
            if (role !== false) {
                user = await db.getItemByQuery({ email, role }, User, false);
            } else {
                user = await db.getItemByQuery({ email }, User, false);
            }
            if (user) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.ITEM_ALREADY_EXISTS,
                        message: 'USER.EMAIL_ALREADY_EXISTS'
                    })
                );
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(
                utils.buildErrObject({
                    ...ErrorCodes.INTERNAL_SERVER_ERROR,
                    info: err.message
                })
            );
        }
    });
};

/**
* Checks if otp token valid or expired
* @param {Object} req - req object
*/
exports.OTPTokenIsValid = async req => {
    return new Promise(async (resolve, reject) => {
        if (
            (req.role === Roles.Seeker || req.role === Roles.Giver) &&
            process.env.NODE_ENV !== 'test'
        ) {
            const otp = await db.getItemByQuery(
                { countryCode: req.country_code, phoneNumber: req.phone_number, token: req.otp_token },
                Otp,
                false
            );
            if (!otp) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.INVALID_TOKEN,
                        message: 'USER.OTP_TOKEN_EXPIRED_OR_INVALID'
                    })
                );
            }
            const minutes = moment(otp.expiry).diff(moment(), 'minutes');
            if (minutes <= 0) {
                reject(
                    utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
                );
            }
            resolve(true);
        } else {
            resolve(true);
        }
    });
};

/**
 * Setting Request of signUp
 * @param {Object} req - request object
 */
exports.setSignUpRequest = req => {
    const response = {
        countryCode: req.country_code,
        phoneNumber: req.phone_number,
        firstName: req.first_name,
        lastName: req.last_name,
        email: req.email,
        password: req.password,
        role: req.role,
        status: Status.Active,
        profilePicture: req.profile_picture ? req.profile_picture : undefined,
        isEmailVerified: false
    };

    return response;
};

/**
 * Checks User model if user with an specific email exists
 * @param {Object} phoneObj - user phone Number object
 * @param {string} role - user role
 */
exports.phoneExists = async (phoneObj, role = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user;
            if (role !== false) {
                user = await db.getItemByQuery({ ...phoneObj, role }, User, false);
            } else {
                user = await db.getItemByQuery({ ...phoneObj }, User, false);
            }
            if (user) {
                reject(
                    utils.buildErrObject({
                        ...ErrorCodes.ITEM_ALREADY_EXISTS,
                        message: 'USER.PHONE_ALREADY_EXISTS'
                    })
                );
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(
                utils.buildErrObject({
                    ...ErrorCodes.INTERNAL_SERVER_ERROR,
                    info: err.message
                })
            );
        }
    });
};


exports.resUser = req => {
    let response = {
        id: req._id,
        first_name: req.firstName,
        last_name: req.lastName,
        role: req.role,
        phone_number: `${req.countryCode}-${req.phoneNumber}`,
        phone_obj: {
            country_code: req.countryCode,
            phone_number: req.phoneNumber
        },
        email: req.email,
        profile_picture: utils.fileFullUrl(req.profilePicture),
        profile_picture_base: req.profilePicture,
        enable_notifications: req.enableNotifications,
        status: req.status,
        is_email_verified: req.isEmailVerified,
        token_expiration: req.accessTokenExpiration,
        created_at: req.createdAt
    };
    return response;
};

/**
* Builds the registration token
* @param {Object} item - user object that contains created id
* @param {string} role - user role
*/
exports.returnSignupToken = async (item, role) => {
    return this.generateToken(item, role);
};



/**
 * Generates a token
 * @param {Object} user - user object
 * @param {string} role - user role
 */
exports.generateToken = async (user, role) => {
    if (typeof user.accessToken !== 'undefined') {
        if (process.env.NODE_ENV === 'test' || role === Roles.Admin) {
            if (await utils.isAccessTokenValid(user.accessToken)) {
                return user.accessToken;
            }
        }
    }

    // Gets expiration time
    const expiration = Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES;

    const userObj = { _id: user._id, role };
    // create signed and encrypted token
    const token = auth.encrypt(
        jwt.sign(
            {
                data: userObj,
                exp: expiration
            },
            process.env.JWT_SECRET
        )
    );

    // Updating Token to DB
    await db.updateItem(user._id, User, { accessToken: token, accessTokenExpiration: expiration });

    return token;
};


/**
 * Make otp request object according to the API
 */
exports.setOTPItem = req => {
    return {
      countryCode: req.country_code,
      phoneNumber: req.phone_number,
      code: req.code,
      expiry: req.expiry,
      token: req.token
    };
  };
 
  

/**
 * Checks if otp expired
 * @param {Object} otp - otp object
 */
exports.OTPIsExpired = async otp => {
    return new Promise((resolve, reject) => {
      const minutes = moment(otp.expiry).diff(moment(), 'minutes');
      console.log(minutes,'adasdadsad',otp)
      if (minutes <= 0) {
        reject(
          utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
        );
      }
  
      resolve(true);
    });
  };
  