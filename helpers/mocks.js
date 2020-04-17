const faker = require('faker');
const ObjectID = require('mongodb').ObjectID;
const totalMocks = 300;


/**
 * Get random int value
 */
exports.getRandom = (max, min = 0) => {
    return Math.floor(Math.random() * (max - min) + min);
  };
  
  /**
   * Get random int value
   */
  exports.randomArrayElement = array => {
    return array[this.getRandom(array.length)];
  };
  
  exports.getRandomYear = () => {
    const start = new Date(1950, 0, 1);
    const end = new Date();
    const newDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return newDate.getFullYear();
  };
  exports.to24DigitObjectId = (leading, num) => {
    const objectId = `000000000000000000000${num}`.slice(-22);
    return `${leading}${objectId}`;
  };

  exports.leadingObjectId = {
    user: '01',
  };