const moment = require('moment');
const zipcodes = require('zipcodes');
const utils = require('../middleware/utils');
const { Roles, ErrorCodes, Status } = require('../enums/index')
const { matchedData } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../middleware/db');
const usersService = require('../services/users');
const User = require('../models/user')
const Otp = require('../models/otp')

exports.signUp = async (req, res) => {
    try {
        let data = matchedData(req);
        // Check if email already exists
        if (typeof data.email !== 'undefined')
            await usersService.emailExists(data.email);
        let phoneObj;
        console.log(data)
        if (typeof data.phone_number !== 'undefined') {
            data = await utils.splitPhoneNumber(data);
            phoneObj = {
                countryCode: data.country_code,
                phoneNumber: data.phone_number
            };
            await usersService.phoneExists(phoneObj);
        }
        // Check if otp token is valid
        await usersService.OTPTokenIsValid(data);

        // Creating a new User
        const userObj = usersService.setSignUpRequest(data);
        const item = await db.createItem(userObj, User);
        console.log(item);
        // Getting User's data for the response
        // const user = await db.getItem(item._id, User);
        const info = utils.setInfo(item, usersService.resUser);
        const token = await usersService.returnSignupToken(item, data.role);
        if (typeof data.phone_number !== 'undefined') {
            // Removing Otp Token
            await db.deleteItemsByQuery(
                {
                    ...phoneObj,
                    token: data.otp_token
                },
                Otp
            );
        }
        let successMsg = 'USER.SIGNUP_SUCCESS';
        utils.handleSuccess(res, successMsg, info, token);
    } catch (error) {
        console.log(error)
        utils.handleError(req, res, error, 'USER.SIGNUP_ERROR');
    }
};
/**
 * Verify Phone function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyPhone = async (req, res) => {
    try {
        let data = matchedData(req);
        data = await utils.splitPhoneNumber(data);
        const phoneObj = {
            countryCode: data.country_code,
            phoneNumber: data.phone_number
        };
        // await usersService.phoneExists(phoneObj);
        data.code = utils.randomNum();
        const body = utils.localeMsg('USER.OTP_SMS_MESSAGE_BODY', { code: data.code });
        data.expiry = moment()
            .add(process.env.OTP_EXPIRATION_IN_MINUTES, 'minutes')
            .toISOString();
        const query = phoneObj;
        const optExists = await db.getItemByQuery(query, Otp, false);
        // Delete all previous OTPs against this number
        if (optExists) {
            await db.deleteItemsByQuery(query, Otp);
        }
        const otp = usersService.setOTPItem(data);
        await db.createItem(otp, Otp);
        // Sending message to user with code
        //   await utils.sendSMS(phoneObj, 'OTP Code', body);

        const info = {};
        if (process.env.NODE_ENV === 'test') {
            info.code = data.code;
        }

        utils.handleSuccess(res, 'USER.OTP_SENT', info);
    } catch (error) {
        utils.handleError(req, res, error);
    }
};


/**
 * Verify OTP Code function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyOTPCode = async (req, res) => {
    try {
        let data = matchedData(req);
        data = await utils.splitPhoneNumber(data);
        const phoneObj = {
            countryCode: data.country_code,
            phoneNumber: data.phone_number
        };
        const query = { ...phoneObj, code: data.code };
        const token = utils.randomCharacters();

        // TODO: Remove It after some time
        if (
            (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'local') &&
            data.code === '101010'
        ) {
            await db.updateItemsByQuery({ ...phoneObj }, Otp, { token });
        } else {
            console.log('adadcz',query)
            const doesCodeExists = await db.getItemByQuery(query, Otp, false);
            console.log(doesCodeExists,'adasdad')
            if (!doesCodeExists) {
                utils.handleError(
                    req,
                    res,
                    utils.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'USER.OTP_EXPIRED' })
                );
                return;
            }
            await usersService.OTPIsExpired(doesCodeExists);
        }

        await db.updateItemByQuery(query, Otp, { token });
        utils.handleSuccess(res, 'USER.OTP_VERIFIED', {}, token);
    } catch (error) {
        // Setting actual message for the api consumer
        if (error.message === 'ERROR.ITEM_NOT_FOUND') {
            error.message = 'USER.OTP_FAILED_TO_MATCH';
        }
        utils.handleError(req, res, error);
    }
};
