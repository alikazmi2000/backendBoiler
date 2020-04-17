const {
  buildErrObject,
  itemNotFound,
  itemAlreadyExists,
  localeMsg,
  isValidDateAndTime
} = require('../middleware/utils');
const { ErrorCodes } = require('../enums');
const moment = require('moment');

/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {};
  sortBy[sort] = order;
  return sortBy;
};

/**
 * Set Range of from and to for filtering
 * @param {string} key - key
 * @param {any} value - value
 */
const setRange = (key, value) => {
  const range = {
    $gte: '',
    $lt: ''
  };
  if (value.from && isValidDateAndTime(value.from)) {
    if (isValidDateAndTime(value.from)) {
      range.$gte = moment(value.from);
    }
  } else {
    delete range.$gte;
  }
  if (value.to && isValidDateAndTime(value.to)) {
    range.$lt = moment(value.to).add(1, 'days');
  } else {
    delete range.$lt;
  }

  return range;
};

module.exports = {
  /**
   * Common Address Model Child
   * @param {Object} result - result object
   */
  address: {
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    location: {
      type: [Number], // [<longitude>, <latitude>]
      index: '2d' // create the geospatial index
    }
  },
  /**
   * Hack for mongoose-paginate, removes 'id' from results
   * @param {Object} result - result object
   */
  cleanPaginationID(result) {
    result.docs.map(element => delete element.id);
    return result;
  },

  /**
   * Builds initial options for query
   * @param {Object} req - query object
   */
  async listInitOptions(req) {
    return new Promise(resolve => {
      const order = req.query.order || -1;
      const sort = req.query.sort && req.query.sort !== 'id' ? req.query.sort : 'createdAt';
      const sortBy = buildSort(sort, order);
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || process.env.RECORD_LIMIT;
      const options = {
        sort: sortBy,
        lean: true,
        page,
        limit
      };
      resolve(options);
    });
  },

  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    // eslint-disable-next-line complexity
    return new Promise((resolve, reject) => {
      try {
        if (typeof query !== 'undefined') {
          const data = {};
          // Validating Filters with single fields
          if (typeof query.search !== 'undefined') {
            data.$and = [];
            const array = [];
            for (const [key, value] of Object.entries(query.search)) {
              // eslint-disable-next-line max-depth
              if (key.indexOf('status') >= 0) {
                array.push({
                  [key]: value
                });
              } else if (value.hasOwnProperty('from')) {
                const range = setRange(key, value);
                // eslint-disable-next-line max-depth
                if (range.hasOwnProperty('$gte')) {
                  array.push({
                    [key]: range
                  });
                }
              } else if (value.indexOf('+') >= 0) {
                const newValue = value.replace('+', '\\+');
                array.push({
                  [key]: {
                    $regex: new RegExp(newValue, 'i')
                  }
                });
              } else if (key.indexOf('Id') < 0 && key.indexOf('serviceAreas') < 0) {
                array.push({
                  [key]: {
                    $regex: new RegExp(value, 'i')
                  }
                });
              } else {
                array.push({
                  [key]: value
                });
              }
            }
            // Puts array result in data
            data.$and = array;
          }

          // Validating Filters with multiple fields
          if (typeof query.filter !== 'undefined' && typeof query.fields !== 'undefined') {
            query.filter = query.filter.replace('+', '\\+');
            data.$or = [];
            const array = [];
            // Takes fields param and builds an array by splitting with ','
            const arrayFields = query.fields.split(',');
            // Adds SQL Like %word% with regex
            arrayFields.map(item => {
              array.push({
                [item]: {
                  $regex: new RegExp(query.filter, 'i')
                }
              });
            });
            // Puts array result in data
            data.$or = array;
            resolve(data);
          }

          if (data.hasOwnProperty('$or') || data.hasOwnProperty('$and')) {
            if (data.hasOwnProperty('$and') && !data.$and.length) {
              delete data.$and;
            }
            if (data.hasOwnProperty('$or') && !data.$or.length) {
              delete data.$or;
            }
            resolve(data);
          } else {
            resolve({});
          }
        } else {
          resolve({});
        }
      } catch (err) {
        reject(
          buildErrObject({
            ...ErrorCodes.UNPROCESSABLE_ENTITY,
            message: 'ERROR_WITH_FILTER',
            info: err.message
          })
        );
      }
    });
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} model - model object
   * @param {Object} query - query object
   * @param {Array} populate - populate Array
   */
  async getItems(req, model, query, populate = false) {
    const options = await this.listInitOptions(req);
    if (populate !== false) {
      options.populate = populate;
    }
    return new Promise((resolve, reject) => {
      model.paginate(query, options, (err, items) => {
        if (err) {
          reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        resolve(this.cleanPaginationID(items));
      });
    });
  },

  /**
   * Gets items using aggregate from database
   * @param {Object} req - request object
   * @param {Object} model - model object
   * @param {Object} aggregate - aggregate object
   */
  async getItemsUsingAggregate(req, model, aggregate) {
    const options = await this.listInitOptions(req);
    return new Promise((resolve, reject) => {
      const aggregateModel = model.aggregate(aggregate);
      model.aggregatePaginate(aggregateModel, options, (err, items) => {
        if (err) {
          reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        resolve(this.cleanPaginationID(items));
      });
    });
  },

  /**
   * Gets item from database by id
   * @param {Object} query - query params
   * @param {Object} model - model object
   */
  async getAllItems(query, model) {
    return new Promise((resolve, reject) => {
      model.find(
        query,
        '',
        {
          sort: {
            createdAt: 1
          }
        },
        (err, items) => {
          if (err) {
            reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
          }
          resolve(items);
        }
      );
    });
  },

  /**
   * Gets item from database by id
   * @param {string} id - item id
   * @param {Object} model - model object
   * @param {Array} populate - populate Array
   */
  async getItem(id, model, populate = false) {
    return new Promise((resolve, reject) => {
      const message = localeMsg('ERROR.UNABLE_TO_FIND_ITEM', { name: model.modelName });
      if (populate !== false) {
        model
          .findById(id, (err, item) => {
            itemNotFound(err, item, reject, message);
            resolve(item);
          })
          .populate(populate);
      } else {
        model.findById(id, (err, item) => {
          itemNotFound(err, item, reject, message);
          resolve(item);
        });
      }
    });
  },

  /**
   * Gets item from database by id
   * @param {Object} query - query object
   * @param {Object} model - model object
   * @param {Boolean} rejectOnError - reject the promise when error found
   * @param {Boolean | Object} populate - populate object or boolean
   */
  async getItemByQuery(query, model, rejectOnError = true, populate = false) {
    return new Promise((resolve, reject) => {
      if (populate !== false) {
        model
          .findOne(query, (err, item) => {
            if (rejectOnError === true) {
              itemNotFound(
                err,
                item,
                reject,
                localeMsg('ERROR.UNABLE_TO_FIND_ITEM', { name: model.modelName })
              );
            }
            resolve(item);
          })
          .populate(populate);
      } else {
        model.findOne(query, (err, item) => {
          if (rejectOnError === true) {
            itemNotFound(
              err,
              item,
              reject,
              localeMsg('ERROR.UNABLE_TO_FIND_ITEM', { name: model.modelName })
            );
          }
          resolve(item);
        });
      }
    });
  },

  /**
   * Gets items from database by id
   * @param {Object} query - query object
   * @param {Object} model - model object
   * @param {Boolean} rejectOnError - reject the promise when error found
   * @param {Boolean | Object} populate - populate object or boolean
   * @param {Object} sort - sort object
   */
  async getItemsByQuery(
    query,
    model,
    rejectOnError = true,
    populate = false,
    sort = { createdAt: -1 }
  ) {
    return new Promise((resolve, reject) => {
      if (populate) {
        model
          .find(query, '', { sort }, (err, item) => {
            if (rejectOnError === true) {
              itemNotFound(err, item, reject);
            }
            resolve(item);
          })
          .populate(populate);
      } else {
        model.find(query, '', { sort }, (err, item) => {
          if (rejectOnError === true) {
            itemNotFound(err, item, reject);
          }
          resolve(item);
        });
      }
    });
  },

  /**
   * Creates a new item in database
   * @param {Object} req - request object
   * @param {Object} model - model object
   */
  async createItem(req, model) {
    return new Promise((resolve, reject) => {
      model.create(req, (err, item) => {
        if (err) {
          reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        resolve(item);
      });
    });
  },

  /**
   * Create new items in database
   * @param {Array} items - items array of object
   * @param {Object} model - model object
   */
  async createItems(items, model) {
    return new Promise((resolve, reject) => {
      model.insertMany(items, (err, docs) => {
        if (err) {
          reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        }
        resolve(docs);
      });
    });
  },

  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} model - model object
   * @param {Object} req - request object
   */
  async updateItem(id, model, req) {
    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(
        id,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          itemNotFound(err, item, reject);
          resolve(item);
        }
      );
    });
  },

  /**
   * Update item in database by query
   * @param {Object} query - query object
   * @param {Object} model - model object
   * @param {Object} req - request object
   */
  async updateItemByQuery(query, model, req) {
    return new Promise((resolve, reject) => {
      model.updateOne(
        query,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          itemNotFound(err, item, reject);
          resolve(item);
        }
      );
    });
  },

  /**
   * Update items in database by query
   * @param {Object} query - query object
   * @param {Object} model - model object
   * @param {Object} req - request object
   */
  async updateItemsByQuery(query, model, req) {
    return new Promise(resolve => {
      model.updateMany(
        query,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          if (err) {
            // Do Nothing
          }
          resolve(item);
        }
      );
    });
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   * @param {Object} model - model object
   */
  async deleteItem(id, model) {
    return new Promise((resolve, reject) => {
      model.deleteById(id, '', (err, item) => {
        itemNotFound(err, item, reject);
        resolve(item);
      });
    });
  },

  /**
   * Deletes items from database by id
   * @param {Object} query - query object
   * @param {Object} model - model object
   */
  async deleteItemsByQuery(query, model) {
    return new Promise((resolve, reject) => {
      model.deleteMany(query, (err, item) => {
        itemNotFound(err, item, reject);
        resolve(true);
      });
    });
  },

  /**
   * Count items from database and query
   * @param {Object} query - query object
   * @param {Object} model - model object
   */
  async countItems(query, model) {
    return new Promise((resolve, reject) => {
      model.count(query, (err, item) => {
        if (err) {
          reject(buildErrObject({ ...ErrorCodes.INTERNAL_SERVER_ERROR, info: err.message }));
        } else {
          resolve(item);
        }
      });
    });
  },

  /**
   * Checks if an item already exists excluding itself
   * @param {string} id - id of item
   * @param {string} field - field name
   * @param {string} value - value
   * @param {Object} model - model object
   * @param {string} message - message to display
   */
  async itemExistsExcludingItself(id, field, value, model, message) {
    return new Promise((resolve, reject) => {
      model.findOne(
        {
          [field]: value,
          _id: {
            $ne: id
          }
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, message);
          resolve(false);
        }
      );
    });
  },

  /**
   * Checks if an item already exists in database
   * @param {string} field - field name
   * @param {string} value - value
   * @param {Object} model - model object
   * @param {string} message - message to display
   */
  async itemExists(field, value, model, message) {
    return new Promise((resolve, reject) => {
      model.findOne(
        {
          [field]: value
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, message);
          resolve(false);
        }
      );
    });
  }
};
