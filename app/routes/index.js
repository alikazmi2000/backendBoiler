const express = require('express');
const router = express.Router();
const fs = require('fs');
const routesPath = `${__dirname}/`;
const { removeExtensionFromFile, handleError, buildErrObject } = require('../middleware/utils');
const { ErrorCodes } = require('../enums');

/*
 * Load routes statically and/or dynamically
 */

// Loop routes path and loads every file as a route except this file
fs.readdirSync(routesPath).filter(file => {
  // Take filename and remove last part (extension)
  const routeFile = removeExtensionFromFile(file);
  if (process.env.NODE_ENV === 'test') {
    // Prevents loading of this file
    return routeFile !== 'index' ? router.use(`/${routeFile}`, require(`./${routeFile}`)) : '';
  }
  // Prevents loading of this file
  return routeFile !== 'index'
    ? router.use(`/${process.env.API_BASE_ROUTE}/${routeFile}`, require(`./${routeFile}`))
    : '';
});

/*
 * Setup routes for index
 */
router.get('/', (req, res) => {
  res.render('index');
});

/*
 * Handle 404 error
 */
router.use('*', (req, res) => {
  handleError(req, res, buildErrObject({ ...ErrorCodes.ENDPOINT_NOT_FOUND }));
});

module.exports = router;
