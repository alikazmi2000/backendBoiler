const EventEmitter = require('events').EventEmitter;
const eventEmitter = new EventEmitter();

// // Requiring Events
// require('../events/conversations')(eventEmitter);
// require('../events/jobs')(eventEmitter);

module.exports = eventEmitter;
