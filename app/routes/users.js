const userCtrl = require('../controllers/users');
// const userValidate = require('../validations/users.validate');
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


module.exports = router;
