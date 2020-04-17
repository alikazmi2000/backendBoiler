const db = require('../middleware/db');
const Setting = require('../models/setting');

/**
 ***********************************************************
 * Public Functions
 ***********************************************************
 */

/**
 * Get settings data
 */
exports.getSettingsObject = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const settings = await db.getAllItems({}, Setting);
      let item = {};
      if (settings.length && settings.hasOwnProperty(0)) {
        item = settings[0];
      } else {
        item = await db.createItem({}, Setting); // {} means It will create setting by default params
      }
      resolve(item);
    } catch (err) {
      reject(err);
    }
  });
};



