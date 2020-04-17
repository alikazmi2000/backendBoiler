const passport = require('passport');
const User = require('../app/models/user');
const auth = require('../app/middleware/auth');
const JwtStrategy = require('passport-jwt').Strategy;

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @param {boolean} fromSockets - is called for socket auth
 * @returns {string} token - decrypted token
 */
exports.jwtExtractor = (req, fromSockets = false) => {
  let token = null;
  if (fromSockets === false) {
    if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '').trim();
    } else if (req.body.token) {
      token = req.body.token.trim();
    } else if (req.query.token) {
      token = req.query.token.trim();
    }
  } else if (req.token) {
    token = req.token;
  }

  if (token) {
    // Decrypts token
    token = auth.decrypt(token);
  }
  return token;
};

/**
 * Options object for jwt middlware
 */
const jwtOptions = {
  jwtFromRequest: this.jwtExtractor,
  secretOrKey: process.env.JWT_SECRET
};

/**
 * Login with JWT middleware
 */
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  const query = { _id: payload.data._id, role: payload.data.role };
  User.findOne(query, '', (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (!user) {
      return done(null, false);
    }
    user.role = payload.data.role;
    return done(null, user);
  });
});

passport.use(jwtLogin);
