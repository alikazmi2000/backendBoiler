const userCtrl = require('../controllers/users');
const userValidate = require('../validations/users.validate');
const { Roles } = require('../enums');
const express = require('express');
const router = express.Router();
require('../../config/passport');
const passport = require('passport');
const { authorized } = require('../middleware/utils');
const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user) => {
    return await authorized(req, res, next, err, user);
  })(req, res, next);
};
const trimRequest = require('trim-request');


/*
 ******************
 * User Auth routes
 ******************
 */

/*
 * SignUp route
 */
router.post(
  '/signup',
  trimRequest.all,
  userValidate.signup,
  userCtrl.signUp
);

/*
 * Verify Phone route
 */
router.post(
  '/verify_phone',
  trimRequest.all,
  userValidate.verifyPhone,
  userCtrl.verifyPhone
);


/*
 * Verify OTP code route
 */
router.post(
  '/verify_otp_code',
  trimRequest.all,
  userValidate.verifyOTPCode,
  userCtrl.verifyOTPCode
);


/*
 * Send verification code route
 */
router.post(
  '/verify_email',
  requireAuth,
  trimRequest.all,
  userCtrl.sendVerificationCode
);

/*
* Verify email code route
*/
router.post(
  '/verify_email_code',
  requireAuth,
  trimRequest.all,
  userValidate.verifyEmailCode,
  userCtrl.verifyEmail
);

/*
 * Login with phone route
 */
router.post(
  '/login_with_phone',
  trimRequest.all,
  userValidate.loginPhone,
  userCtrl.login
);

module.exports = router;
