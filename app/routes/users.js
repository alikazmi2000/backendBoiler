const userCtrl = require('../controllers/users');
const userValidate = require('../validations/users.validate');
const { Roles } = require('../enums');
const express = require('express');
const router = express.Router();
require('../../config/passport');
const passport = require('passport');
const { authenticate } = require('../middleware/utils');

const trimRequest = require('trim-request');


/*
 ******************
 * User Auth routes
 ******************
 */

/*
 * test
 */
router.post(
  '/login',
  trimRequest.all,
  userValidate.loginValidator,
  userCtrl.login
);
router.get(
  '/test',
  authenticate,
  trimRequest.all,
  userCtrl.test
);
// /*
//  * Login with phone route
//  */
// router.post(
//   '/login',
//   trimRequest.all,
//   userValidate.loginPhone,
//   userCtrl.login
// );

module.exports = router;
