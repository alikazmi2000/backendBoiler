const jwt = require('jsonwebtoken');
const auth = require('./auth');
const logger = require('../../config/winston');
const requestIp = require('request-ip');
const bcrypt = require('bcrypt-nodejs');
const { validationResult } = require('express-validator');
const i18n = require('i18n');
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const moment = require('moment');
const passport = require('passport');
const awsSDK = require('aws-sdk');
const { ErrorCodes } = require('../enums');
const nodemailer = require('nodemailer');
/**
 * check is date is valid or not
 * @param {string} value - date string
 */
exports.isValidDate = value => {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return false;
  }
  const date = new Date(value);
  if (!date.getTime()) {
    return false;
  }
  return date.toISOString().slice(0, 10) === value;
};

/**
 * check is date and time is valid or not
 * @param {string} value - date and time string
 */
exports.isValidDateAndTime = value => {
  return moment(value).isValid();
};

/**
 * Get Now Date Time
 */
exports.getNowDateTime = () => {
  return new Date().toISOString();
};

/**
 * Removes extension from file
 * @param {string} file - filename
 */
exports.removeExtensionFromFile = file => {
  return file
    .split('.')
    .slice(0, -1)
    .join('.')
    .toString();
};

/**
 * Gets IP from user
 * @param {*} req - request object
 */
exports.getIP = req => requestIp.getClientIp(req);

/**
 * Gets browser info from user
 * @param {*} req - request object
 */
exports.getBrowserInfo = req => req.headers['user-agent'];

/**
 * Gets country from user using CloudFlare header 'cf-ipcountry'
 * @param {*} req - request object
 */
exports.getCountry = req => (req.headers['cf-ipcountry'] ? req.headers['cf-ipcountry'] : 'XX');

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {String} message - message string
 * @param {Object} data - response data object or array
 * @param {String} token - encrypted jwt token
 */
exports.handleSuccess = (res, message, data, token = undefined) => {
  const response = {
    meta: {
      code: 1000,
      message: message !== undefined && message ? this.localeMsg(message) : ''
    }
  };

  if (token !== undefined) {
    response.token = token;
    response.data = data;
  } else {
    response.data = data;
  }
  // Sends success to user
  res.status(200).json(response);
};

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} err - error object
 * @param {Object} generalMsg - msg to show in production
 */
// eslint-disable-next-line complexity,no-unused-vars
exports.handleError = (req, res, err, generalMsg = false, outSideBody = false) => {
  // Prints error in console
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 1) {
    console.log(err);
  }

  // This is due to the locale issue in i18n package
  if (err.message) {
    err.message = err.message.replace(':', '');
  } else {
    err.message = generalMsg;
  }
  const msg = this.localeMsg(err.message);
  const log = this.createLogObject(req, err, msg);

  if (typeof err.httpStatus !== 'undefined' && err.httpStatus === 500) {
    logger.error(log);
  } else {
    logger.warn(log);
  }

  if (typeof err.httpStatus === 'undefined') {
    err = ErrorCodes.UNKNOWN_ERROR;
  }

  const response = {
    meta: {
      code: err.code,
      message: msg
    },
    message: outSideBody === true ? msg : undefined,
    data: {}
  };

  // Setting Validation Error when bad request
  if (err.errors !== undefined) {
    response.meta.errors = err.errors;
  }

  // Setting Extra Info for the internal server error
  if (err.info !== undefined && process.env.NODE_ENV !== 'production') {
    response.meta.info = err.info;
  }

  if (process.env.NODE_ENV === 'test') {
    console.log(response);
  }
  // Sends error to user
  res.status(err.httpStatus).json(response);
};

/**
 * Builds error object
 * @param {Object} errObj - { httpStatus, code, message, errors }
 */
exports.buildErrObject = errObj => {
  const { httpStatus, code, message, errors, info } = errObj;
  return {
    httpStatus,
    code,
    message,
    errors,
    info
  };
};

/**
 * Builds error for validation files
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} next - next object
 */
exports.validationResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    return next();
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    let message = '';
    if (typeof err.errors !== 'undefined' && err.errors.hasOwnProperty(0)) {
      message = this.localeMsg(err.errors[0].msg, {
        field: this.toHumanReadable(err.errors[0].param)
      });

      const rEToCheck = /^([a-zA-Z]{1,})(\[[0-9\]]{1,}).([a-zA-Z]{1,}){1,}$/;
      if (rEToCheck.test(err.errors[0].param)) {
        message = this.localeMsg('JOB.FILL_ALL_ANSWERS');
      }
    }
    const formatResult = validationResult.withDefaults({
      formatter: error => {
        return { message: this.localeMsg(error.msg, { field: this.toHumanReadable(error.param) }) };
      }
    });
    return this.handleError(
      req,
      res,
      this.buildErrObject({
        ...ErrorCodes.BAD_REQUEST,
        message,
        errors: formatResult(req).mapped()
      })
    );
  }
};

/**
 * Builds success object
 * @param {string} message - success text
 */
exports.buildSuccessObject = message => {
  return {
    message
  };
};

/**
 * Get user id from auth token present in the header
 */
exports.getAuthUserId = req => {
  return typeof req.user !== 'undefined' ? req.user._id : false;
};

/**
 * Get conversation id from socket present in the header
 */
exports.getConversationIdFromSocket = req => {
  return typeof req.user !== 'undefined' ? req.user.conversationId : false;
};

/**
 * Get user role from auth token present in the header
 */
exports.getAuthUserRole = req => {
  return req.user.role;
};

/**
 * Checks if given ID is good for MongoDB
 * @param {string} id - id to check
 */
exports.isIDGood = async id => {
  return new Promise((resolve, reject) => {
    const goodID = String(id).match(/^[0-9a-fA-F]{24}$/);
    return goodID ? resolve(id) : reject(this.buildErrObject({ ...ErrorCodes.ID_MALFORMED }));
  });
};

/**
 * Checks if given ID is matched for another ID
 * @param {string} id - id from the Mongodb
 * @param {string} reqId - id to check
 */
exports.isIDMatched = async (id, reqId) => {
  return new Promise((resolve, reject) => {
    if (id !== reqId) {
      reject(
        this.buildErrObject({ ...ErrorCodes.UNPROCESSABLE_ENTITY, message: 'ID_NOT_MATCHED' })
      );
    } else {
      resolve(id);
    }
  });
};

/**
 * Item not found
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemNotFound = (err, item, reject, message = 'ERROR.ITEM_NOT_FOUND') => {
  if (err) {
    reject(this.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
  }
  if (!item || item.length <= 0) {
    reject(this.buildErrObject({ ...ErrorCodes.ITEM_NOT_FOUND, message }));
  }
};

/**
 * Item already exists
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemAlreadyExists = (err, item, reject, message) => {
  if (err) {
    reject(this.buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
  }
  if (item) {
    reject(this.buildErrObject({ ...ErrorCodes.ITEM_ALREADY_EXISTS, message }));
  }
};

/**
 * Validate Auth Token
 * @param {Object} req - req object
 * @param {Object} res - res object
 * @param {Object} next - next object
 */
exports.requireAuth = (req, res, next) => {
  passport.authenticate(
    'jwt',
    {
      session: false
    },
    (err, user, info) => {
      if (err || info) {
        if (process.env.NODE_ENV === 'development' && info !== undefined) {
          console.log(info);
        }
        this.handleError(req, res, this.buildErrObject({ ...ErrorCodes.UNAUTHORIZED }));
      }
    }
  )(req, res, next);
};

/**
 * Generate random number with specific length
 * @param {Number} n length on random numbers
 */
exports.randomPassword = n => {
  const add = 1;
  let max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  max = Math.pow(10, n + add);
  const min = max / 10; // Math.pow(10, n) basically
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get message on the basis of locale
 * @param {string} key - message
 * @param {Object} params - parameters Object
 */
exports.localeMsg = (key, params = false) => {
  if (params) {
    return i18n.__(`${key}`, params);
  }
  return i18n.__(`${key}`);
};

/**
 * Send Email through SendGrid
 * @param {string} to - email of receiver
 * @param {string} subject - email subject
 * @param {string} body - content of the email either in plain text or html
 */
exports.sendEmail = (to, subject, body) => {
  if (process.env.NODE_ENV !== 'test') {
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to,
      from: process.env.MAIL_FROM_ADDRESS,
      subject: this.localeMsg(subject),
      html: body
    };
    // callback function may have two parameters (error, result)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_FROM_ADDRESS,
        pass: 'alikazmi2000'
      }
    });
    console.log('process.env.MAIL_FROM_ADDRESS',process.env.MAIL_FROM_ADDRESS)
    transporter.sendMail(msg, (error, response) => {
      if (error) {
        console.log(error);
      }
      console.log(response)
    });
    // sgMail.send(msg, error => {
    //   if (error) {
    //     console.log(error.message);
    //   } else {
    //     // Everything is ok
    //   }
    // });
  }
};

/**
 * Send SMS through Twilio
 * @param {string} to - phone of receiver
 * @param {string} subject - subject
 * @param {string} body - content of the email either in plain text or html
 */
exports.sendSMS = async (to, subject, body) => {
  return new Promise(resolve => {
    if (process.env.NODE_ENV !== 'test') {
      const phoneNumber = `${to.countryCode}${to.phoneNumber}`;
      // For Testing Need to Send an Email
      if (process.env.NODE_ENV === 'development') {
        const newBody = `${body}<br /><br />Sent SMS to ${phoneNumber}`;
        this.sendEmail(process.env.PROJECT_DEVELOPER_EMAIL, this.localeMsg(subject), newBody);
      }

      const accountSid = process.env.TWILIO_SID;
      const authToken = process.env.TWILIO_ACCESS_TOKEN;
      const client = twilio(accountSid, authToken);

      client.messages
        .create({
          to: phoneNumber,
          from: process.env.TWILIO_ADMIN_PHONE,
          body
        })
        .then(message => resolve(message))
        .catch(err => {
          logger.error(this.createLogObject({}, err, err.message));
          // Making All requests to true for security reasons
          resolve(true);
        });
    } else {
      resolve(true);
    }
  });
};

/**
 * Get Email Template
 * @param {string} file - name of the template file
 */
exports.emailTemplate = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, `../templates/${file}.html`), 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Create Log Object
 * @param {Object} req - req object
 * @param {string} msg - msg string
 * @param {Object} err - err object
 */
exports.createLogObject = (req, msg, err) => {
  return {
    time: new Date(),
    ip: typeof req.ip !== 'undefined' ? req.ip : undefined,
    method: typeof req.method !== 'undefined' ? req.method : undefined,
    originalUrl: typeof req.originalUrl !== 'undefined' ? req.originalUrl : undefined,
    request: typeof req.body !== 'undefined' ? req.body : undefined,
    message: msg,
    response: err,
    stacktrace: new Error().stack
  };
};

/**
 * Is Empty Array
 */
exports.isArrayEmpty = array => {
  return !(typeof array !== 'undefined' && typeof array.length !== 'undefined' && array.length);
};

/**
 * Is Empty Object
 */
exports.isObjectEmpty = obj => {
  if (typeof obj === 'undefined') {
    return obj;
  }
  return Object.keys(obj).length === 0;
};

/**
 * Generate a random number
 */
exports.randomNum = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Generate random characters
 */
exports.randomCharacters = (length = process.env.RANDOM_STRING_CHARACTERS) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    str += charset.charAt(Math.floor(Math.random() * n));
  }
  return str;
};

/**
 * Generate transaction id
 */
exports.generateTransactionId = () => {
  const charset = '0123456789';
  let str = '';
  for (let i = 0, n = charset.length; i < 10; ++i) {
    str += charset.charAt(Math.floor(Math.random() * n));
  }
  return str;
};

/**
 * Upload File Without Validation
 * @param {Object} req - request object
 * @param {string} fieldName - file field
 * @param {string} fileNameBeginWith - filename
 */
exports.uploadFile = (req, fieldName, fileNameBeginWith) => {
  return new Promise((resolve, reject) => {
    if (
      typeof req.files !== 'undefined' &&
      req.files !== null &&
      typeof req.files[fieldName] !== 'undefined' &&
      req.files[fieldName].name
    ) {
      const file = req.files[fieldName];
      const filename = `${fileNameBeginWith}-${file.name}`;
      const filePath = `${process.env.PATH_ASSETS}/${filename}`;
      file.mv(filePath, err => {
        if (err) {
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            reject(
              this.buildErrObject({
                ...ErrorCodes.INTERNAL_SERVER_ERROR,
                message: err.message
              })
            );
          } else {
            reject(
              this.buildErrObject({
                ...ErrorCodes.INTERNAL_SERVER_ERROR,
                message: 'ERROR.UNABLE_TO_UPLOAD_FILE'
              })
            );
          }
        } else {
          resolve(filename);
        }
      });
    } else {
      resolve(null);
    }
  });
};

/**
 * Creates an object with properties
 * @param {Object} req - request object
 * @param {Function} resFunc - response function
 * @param {Boolean} multiple - data is in array?
 * @param {Boolean} paginate - is paginated?
 */
exports.setInfo = (req, resFunc, multiple = false, paginate = true) => {
  let res = {};
  if (multiple) {
    if (paginate) {
      res = { ...req };
      res.docs = [];
      for (const item of req.docs) {
        res.docs.push(resFunc(item));
      }
    } else {
      res = [];
      for (const item of req) {
        res.push(resFunc(item));
      }
    }
  } else {
    res = resFunc(req);
  }
  return res;
};

/**
 * Check No Value
 * @param {Object} item - obj or string
 */
exports.checkNoValue = item => {
  if (item !== undefined) {
    return item;
  }
  return null;
};

/**
 * Remove an object from array by Id
 * @param {string} id - id
 * @param {Array} arr - array of object
 */
exports.removeObjectById = (id, arr) => {
  return arr.filter(s => s._id.toString() !== id);
};

/**
 * Setting up Children
 * @param {Object} result - response object
 * @param {Array} items - response array
 * @param {Function} resModel - response function
 */
exports.settingUpChildren = (result, items, resModel) => {
  if (items !== undefined && items.length > 0) {
    for (const item of items) {
      result.push(resModel(item));
    }
  }

  return result;
};

/**
 * Setting up a single child
 * @param {Object} response - response Object
 * @param {string} key - key value
 * @param {string} newKey - newKey value
 * @param {string} mainKey - mainKey value
 * @param {Function} resModel - response function
 */
exports.settingUpChild = (response, key, newKey, resModel, mainKey = false) => {
  if (mainKey !== false) {
    if (
      typeof response[mainKey] !== 'undefined' &&
      typeof response[mainKey][key] !== 'undefined' &&
      typeof response[mainKey][key] === 'object' &&
      response[mainKey][key]
    ) {
      if (!response[mainKey][key].hasOwnProperty('id')) {
        response[mainKey][newKey] = resModel(response[mainKey][key]);
        response[mainKey][key] = response[mainKey][newKey].id;
        return response;
      }
    }
  } else if (
    typeof response[key] !== 'undefined' &&
    typeof response[key] === 'object' &&
    response[key]
  ) {
    if (!response[key].hasOwnProperty('id')) {
      response[newKey] = resModel(response[key]);
      response[key] = response[newKey].id;
      return response;
    }
  }

  return response;
};

/**
 * Setting up a child array
 * @param {Object} response - response Object
 * @param {string} key - key value
 * @param {string} newKey - newKey value
 * @param {Function} resModel - response function
 */
exports.settingUpChildArray = (response, key, newKey, resModel) => {
  if (typeof response[key] !== 'undefined' && typeof response[key] === 'object' && response[key]) {
    const final = [];
    for (const item of response[key]) {
      if (!item.hasOwnProperty('id')) {
        final.push(resModel(item));
      }
    }
    response[key] = final;
  }
  return response;
};

/**
 * Setting file path
 * @param {string} file - file name
 * @param {string} shortPath - shortPath value
 */
exports.fileFullPath = (file, shortPath = '/') => {
  return file ? process.env.PATH_ASSETS + shortPath + file : undefined;
};

/**
 * Setting full URL with the short path
 * @param {string} file - file name
 * @param {string} shortPath - shortPath value
 */
exports.fileFullUrl = (file, shortPath = '/') => {
  return file ? process.env.S3_BUCKET_IMAGE_URL + shortPath + file : undefined;
};

/**
 * Splitting Phone Number with dash (-)
 * @param {Object} data - matched data req Object
 */
exports.splitPhoneNumber = data => {
  return new Promise((resolve, reject) => {
    try {
      if (!data.phone_number.includes('-')) {
        reject(
          this.buildErrObject({ ...ErrorCodes.BAD_REQUEST, message: 'ERROR.INVALID_PHONE_NUMBER' })
        );
      } else {
        const dataSplit = data.phone_number.split('-');
        // eslint-disable-next-line camelcase
        data.country_code = dataSplit[0];
        // eslint-disable-next-line camelcase
        data.phone_number = dataSplit[1];

        resolve(data);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      reject(
        this.buildErrObject({ ...ErrorCodes.BAD_REQUEST, message: 'ERROR.INVALID_PHONE_NUMBER' })
      );
    }
  });
};

/**
 * Setting Common Search Parameter Filters
 * @param {Object} fields - fields object
 * @param {Object} query - query object
 */
exports.setSearchParamsFilter = (fields, query) => {
  const newQuery = query;

  if (typeof newQuery.fields !== 'undefined') {
    Object.keys(fields).map(key => {
      newQuery.fields = newQuery.fields.replace(key, fields[key]);
    });
  }
  if (typeof newQuery.search !== 'undefined') {
    const search = [];
    for (const [key, value] of Object.entries(fields)) {
      if (newQuery.search.hasOwnProperty(key)) {
        search[value] = newQuery.search[key];
      }
    }
    newQuery.search = search;
  }

  return newQuery;
};

/**
 * Is Image
 * @param {string} fieldName - field name
 * @param {string} options - other validator options
 * @param {string} allowedFormats - allowed formats for the files
 * @param {boolean} isRequired - is file is required
 */
exports.isFileCorrect = (fieldName, options, allowedFormats, isRequired = false) => {
  const { req } = options;
  // Checking if user uploaded a file or not
  if (typeof req.files === 'undefined' || req.files === null) {
    if (isRequired) {
      throw new Error('ERROR.NO_FILE_ATTACHED');
    } else {
      return true;
    }
  }

  // Checking either user uploaded file in correct field or not
  if (typeof req.files[fieldName] === 'undefined' || !req.files[fieldName].name) {
    throw new Error(this.localeMsg('ERROR.MISSING_FILE', { title: fieldName }));
  }

  // Checking file acceptable formats
  const file = req.files[fieldName];
  const filetypes = new RegExp(allowedFormats);
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.name).toLowerCase());
  if (!mimetype || !extname) {
    const allowedFormatsComma = allowedFormats.replace(new RegExp('\\|', 'g'), ', ');
    throw new Error(this.localeMsg('ERROR.INCORRECT_FORMAT', { formats: allowedFormatsComma }));
  }

  return true;
};

/**
 * Checking Authorization
 * @param {Object} req - req object
 * @param {Object} res - res object
 * @param {Object} next - next object
 * @param {Object} err - err object
 * @param {Object} user - user object
 */
exports.authorized = async (req, res, next, err, user) => {
  if (err) {
    return next(err);
  }
  if (!user) {
    return this.handleError(req, res, this.buildErrObject({ ...ErrorCodes.UNAUTHORIZED }));
  }
  const tokenEncrypted = this.getAccessTokenFromHeader(req);
  if (typeof user.accessToken !== 'undefined' && user.accessToken === tokenEncrypted) {
    req.user = { _id: user._id, role: user.role };
    return next();
  }
  const isTokenValid = await this.isAccessTokenValid(tokenEncrypted);
  if (isTokenValid) {
    return this.handleError(
      req,
      res,
      this.buildErrObject({
        ...ErrorCodes.UNAUTHORIZED,
        message: 'ERROR.LOGGED_IN_WITH_OTHER_DEVICE'
      })
    );
  }
  return this.handleError(req, res, this.buildErrObject({ ...ErrorCodes.UNAUTHORIZED }));
};

/**
 * Check token is valid or not
 * @param {string} token - Encrypted and encoded token
 */
exports.isAccessTokenValid = async token => {
  return new Promise(resolve => {
    // Decrypts, verifies and decode token
    jwt.verify(auth.decrypt(token), process.env.JWT_SECRET, err => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
};

/**
 * Get Access Token From Request Header
 * @param {Object} req - req object
 */
exports.getAccessTokenFromHeader = req => {
  if (typeof req.headers !== 'undefined' && typeof req.headers.authorization !== 'undefined') {
    return req.headers.authorization.replace('Bearer ', '').trim();
  }

  return '';
};

/**
 * Uploading File on AWS S3 Bucket
 * @param {Object} file - file object
 * @param {string} fileName - fileName
 */
exports.uploadFileOnAWS = (file, fileName) => {
  awsSDK.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  });
  const s3 = new awsSDK.S3();
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: String(process.env.S3_BUCKET_NAME),
        Key: `${fileName}-${file.name}`,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: 'public-read'
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(data);
          }
          resolve(data);
        }
      }
    );
  });
};

/**
 * Checking File exists on AWS S3 Bucket
 * @param {string} file - file key
 */
exports.isFileExistsOnAWS = file => {
  awsSDK.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  });
  const s3 = new awsSDK.S3();

  return new Promise((resolve, reject) => {
    s3.headObject(
      {
        Bucket: String(process.env.S3_BUCKET_NAME),
        Key: file
      },
      (err, data) => {
        if (err) {
          if (process.env.NODE_ENV === 'development') {
            console.log(err);
          }
          if (err.code === 'NotFound') {
            resolve(null);
          } else {
            reject(err.code);
          }
        } else {
          resolve(data);
        }
      }
    );
  });
};

/**
 * Checking File exists on AWS S3 Bucket Validator
 * @param {string} file - file name
 */
exports.isFileExistsOnAWSValidator = async file => {
  // For testing we are not showing credentials of the S3 Bucket
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  if (file) {
    const isFileExists = await this.isFileExistsOnAWS(file);
    if (!isFileExists) {
      throw new Error(this.localeMsg('ERROR.FILE_NOT_EXISTS', { file }));
    }
  }

  return true;
};

/**
 * Hashed Password
 * @param {string} password - password
 */
exports.hashedPassword = password => {
  return new Promise((resolve, reject) => {
    const SALT_FACTOR = 5;
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, null, (error, newHash) => {
          if (error) {
            reject(error);
          } else {
            resolve(newHash);
          }
        });
      }
    });
  });
};

/**
 * Checks User is authorized for this action or not
 * @param {string} myUserId - logged-in user
 * @param {string} userId - actual user to compare
 */
exports.isAuthorizedForThisAction = (myUserId, userId) => {
  return new Promise((resolve, reject) => {
    if (myUserId.toString() === userId.toString()) {
      resolve(true);
    } else {
      reject(
        this.buildErrObject({
          ...ErrorCodes.METHOD_NOT_ALLOWED,
          message: 'ERROR.NOT_AUTHORIZED_FOR_THIS_ACTION'
        })
      );
    }
  });
};

const capitalize = word => {
  return word.charAt(0).toUpperCase() + word.substring(1);
};

/**
 * Make variable/property to human readable
 * @param {string} property - property
 */
exports.toHumanReadable = property => {
  if (property) {
    const words = property.split('_');
    property = words.map(capitalize).join(' ');
    property = property.replace('Id', '').trim(); // To removed Id due to non-technical person message
  }
  return property;
};

/**
 * Conversion to UTC ISO string from local time
 * @param {string} date - date in ISO String
 */
exports.toUTCISOString = date => {
  if (moment(date).isValid()) {
    logger.info({ message: 'APPOINTMENT TIME ZONE BEFORE CONVERSION', date });
    const newDate = moment(date)
      .utc(false)
      .toISOString();
    logger.info({ message: 'APPOINTMENT TIME ZONE AFTER CONVERSION', newDate });
    return newDate;
  }
  return false;
};

/**
 * Limit Numbers Validation
 * @param {string} field - field name
 * @param {string} value - field value
 * @param {number} min - min value
 * @param {number} max - max value
 */
exports.limitNumbers = (field, value, min = 1, max = 50) => {
  if (!(value >= min && value < max)) {
    throw new Error(this.localeMsg('NUMBER_LIMIT_NOT_MATCHED', { field, min, max }));
  }
  return true;
};
