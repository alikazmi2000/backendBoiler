/*
 ***************************************************************
 * This file is created to remove duplications in the unit tests
 ***************************************************************
 */
const { Roles } = require('../app/enums');
const { to24DigitObjectId, leadingObjectId } = require('./mocks');

/*
 *******************
 * Private Functions
 *******************
 */

/**
 * Validate response to have required properties
 * @param {Object} res - response object
 */
const validateResponse = res => {
  res.body.should.be.a('object');
  res.body.should.have.property('meta');
  res.body.meta.should.have.property('code');
  res.body.meta.should.have.property('message');
  res.body.should.have.property('data');
};

/*
 ******************
 * Public Functions
 ******************
 */

/**
 * Validate success response should have required properties
 * @param {Object} res - response object
 */
exports.validateSuccess = res => {
  res.should.have.status(200);
  validateResponse(res);
};

/**
 * get auth token
 * @param {Object} res - response object
 */
exports.getAuthToken = res => {
  this.validateSuccess(res);
  res.body.should.have.property('token');
  return res.body.token;
};

/**
 * get otp token
 * @param {Object} res - response object
 */
exports.getOTPToken = res => {
  this.validateSuccess(res);
  res.body.should.have.property('token');
  return res.body.token;
};

/**
 * validate collection of result
 * @param {Object} res - response object
 */
exports.validateCollection = res => {
  this.validateSuccess(res);
  res.body.data.docs.should.be.a('array');
};

/**
 * validate keys and success of result
 * @param {Object} res - response object
 * @param {Array} keys - keys array
 */
exports.validateWithKeys = (res, keys) => {
  this.validateSuccess(res);
  res.body.data.should.include.keys(...keys);
};

/**
 * Validate Unprocessable entity response
 * @param {Object} res - response object
 * @param {Boolean} isErrorsRequired - errors object required or not
 */
exports.validateBadRequest = (res, isErrorsRequired = false) => {
  res.should.have.status(400);
  validateResponse(res);
  if (isErrorsRequired !== false) {
    res.body.meta.should.have.property('errors');
  }
};

/**
 * Validate Unprocessable entity response
 * @param {Object} res - response object
 */
exports.validateConflict = res => {
  res.should.have.status(409);
  validateResponse(res);
};

/**
 * Validate Not Found response
 * @param {Object} res - response object
 */
exports.validateNotFound = res => {
  res.should.have.status(404);
  validateResponse(res);
};

/**
 * Validate Unprocessable entity response
 * @param {Object} res - response object
 */
exports.validateUnprocessable = res => {
  res.should.have.status(422);
  validateResponse(res);
};

/**
 * Validate Un-Authorized response
 * @param {Object} res - response object
 */
exports.validateUnauthorized = res => {
  res.should.have.status(401);
  // TODO: Check 401 response with all properties meta, code and message
};

/**
 * Delete records from the database
 * @param {Object} model - model object
 * @param {Array} arr - array of ObjectIds
 */
exports.deleteTestRecords = (model, arr) => {
  arr.forEach(id => {
    model.findByIdAndRemove(id, err => {
      if (err) {
        console.log(err);
      }
    });
  });
};

/**
 * Delete a single record from the database
 * @param {Object} model - model object
 * @param {string} id - ObjectId
 */
exports.deleteTestRecord = (model, id) => {
  model.findByIdAndRemove(id, err => {
    if (err) {
      console.log(err);
    }
  });
};

/**
 * Retrieve a common test account by role
 * @param {string} role - user role
 */
exports.accountCredentials = role => {
  let credentials = {};
  switch (role) {
    case Roles.Admin:
      credentials = {
        email: 'test@gmail.com',
        password: '123456',
        role: Roles.Admin
      };
      break;
    case Roles.Requester:
      credentials = {
        email: 'test@gmail.com',
        password: '123456',
        role: Roles.Requester
      };
      break;
    case Roles.Manager:
      credentials = {
        email: 'test@gmail.com',
        password: '123456',
        role: Roles.Manager
      };
      break;
    case Roles.Provider:
      credentials = {
        email: 'test@gmail.com',
        password: '123456',
        role: Roles.Provider
      };
      break;
  }

  return credentials;
};

/**
 * Retrieve Test Ids by module
 * @param {string} collection - collection name
 * @param {string} arg - arg extra
 */
// eslint-disable-next-line complexity
exports.testId = (collection, arg = false) => {
  let id;

  switch (collection) {
    case 'serviceArea':
      id = to24DigitObjectId(leadingObjectId.serviceArea, 0);
      break;
    case 'document':
      id = to24DigitObjectId(leadingObjectId.document, 0);
      break;
    case 'document_2':
      id = to24DigitObjectId(leadingObjectId.document, 1);
      break;
    case 'category':
      id = to24DigitObjectId(leadingObjectId.category, 0);
      break;
    case 'categoryQuestion':
      id = to24DigitObjectId(leadingObjectId.categoryQuestion, 0);
      break;
    case 'categoryContract':
      id = to24DigitObjectId(leadingObjectId.categoryContract, 0);
      break;
    case 'user':
      if (arg === Roles.Requester) {
        id = to24DigitObjectId(leadingObjectId.user, 1);
      } else if (arg === Roles.Manager) {
        id = to24DigitObjectId(leadingObjectId.user, 2);
      } else {
        id = to24DigitObjectId(leadingObjectId.user, 3);
      }
      break;
    case 'userProperty':
      id = to24DigitObjectId(leadingObjectId.userProperty, 0);
      break;
    case 'job':
      id = to24DigitObjectId(leadingObjectId.job, 0);
      break;
    case 'transaction':
      id = to24DigitObjectId(leadingObjectId.transaction, 0);
      break;
  }

  return id;
};
