const mongoose = require('mongoose');
const loadModels = require('../app/models');
const DB_URL = process.env.MONGO_URI;

module.exports = () => {
  const connect = () => {
    mongoose.Promise = global.Promise;

    mongoose.connect(
      DB_URL,
      {
        keepAlive: true,
        reconnectTries: Number.MAX_VALUE,
        useNewUrlParser: true
      },
      err => {
        let dbStatus = '';
        if (err) {
          dbStatus = `${err}`;
        } else {
          dbStatus = `OK`;
        }
        if (process.env.NODE_ENV !== 'test') {
          // Prints initialization
          console.log(
            `Started server using port "${process.env.PORT || 3000}"` +
              `, environment "${process.env.NODE_ENV}" ` +
              `and MongoDB with connection status "${dbStatus.toString()}".`
          );
        }
      }
    );
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    // mongoose.set('debug', true);
  };
  connect();

  mongoose.connection.on('error', console.log);
  mongoose.connection.on('disconnected', connect);

  loadModels();
};
