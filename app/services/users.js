const moment = require('moment');
const jwt = require('jsonwebtoken');
const mustache = require('mustache');
const stripe = require('../../config/stripe');
const User = require('../models/user');
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
