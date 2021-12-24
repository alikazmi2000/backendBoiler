require('dotenv-safe').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const app = express();
const i18n = require('i18n');
const initMongo = require('./config/mongo');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const sequelize = require('./config/mysql');

// Setup express server port from ENV, default: 3000
app.set('port', process.env.PORT || 3000);

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// for parsing json
app.use(
  bodyParser.json({
    limit: '20mb'
  })
);

// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
);

// i18n
i18n.configure({
  locales: ['en'], // for additional locales ['en', 'es']
  directory: `${__dirname}/locales`,
  defaultLocale: 'en',
  objectNotation: true,
  updateFiles: false
});
app.use(i18n.init);

// Init all other stuff
app.use(cors());
// app.use(passport.initialize());
app.use(compression());
app.use(helmet());
app.use(fileUpload());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
let routes = require('./app/routes');
app.use(routes);

// Multicore enabled by env variable
let server;

sequelize
  //.sync({force : true})
  .sync()
  .then(() => {
    if (process.env.USE_MULTICORE === 'true') {
      // Init Multicore Server
      const numCPUs = os.cpus().length;
      if (cluster.isMaster) {
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
        }
        // paramters (worker, code, signal)
        cluster.on('exit', worker => {
          console.log(`worker ${worker.process.pid} died`);
        });
      } else {
        server = app.listen(app.get('port'));
      }
    } else {
      server = app.listen(app.get('port'));
    }
    //pending set timezone
    console.log("App listening on port " + process.env.PORT);
  })
  .catch(err => {
    console.log(err);
  });
// Init MongoDB
// initMongo();

// Init Sockets
// const io = require('socket.io')(server);
// require('./app/events/socket.events')(io);

// Requiring All Event listeners
// require('./app/events');
module.exports = app; // for testing
