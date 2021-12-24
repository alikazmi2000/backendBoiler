
const Status = Object.freeze({
  Active: 'active',
  Sent: 'sent',
  Received: 'received',
  Pending: 'pending',
  Completed: 'completed',
  InProgress: 'in_progress',
  Accepted: 'accepted',
  Rejected: 'rejected',
  Blocked: 'blocked',
  Cancelled: 'cancelled',
  Confirmed: 'confirmed',
  InActive: 'inactive',
  New: 'new',
  Archived: 'archived',
  Paid: 'paid',
  NotPaid: 'not_paid',
  Scheduling: 'scheduling'
});

const Roles = Object.freeze({
  SuperAdmin: 'super_admin',
  Admin: 'admin',
});



const DeviceTypes = Object.freeze({
  Web: 'web',
  Android: 'android',
  IOS: 'ios'
});



const ErrorCodes = Object.freeze({
  INTERNAL_SERVER_ERROR: { httpStatus: 500, code: 0, message: 'ERROR.INTERNAL_SERVER_ERROR' },
  NOT_FOUND: { httpStatus: 404, code: 1, message: 'ERROR.NOT_FOUND' },
  BAD_REQUEST: { httpStatus: 400, code: 2, message: 'ERROR.BAD_REQUEST' },
  ID_MALFORMED: { httpStatus: 400, code: 2, message: 'ERROR.ID_MALFORMED_GENERAL' },
  UNAUTHORIZED: { httpStatus: 401, code: 3, message: 'ERROR.UNAUTHORIZED' },
  INVALID_REQUEST: { httpStatus: 400, code: 4, message: 'ERROR.INVALID_REQUEST' },
  ENDPOINT_NOT_FOUND: { httpStatus: 404, code: 5, message: 'ERROR.ENDPOINT_NOT_FOUND' },
  METHOD_NOT_ALLOWED: { httpStatus: 405, code: 6, message: 'ERROR.METHOD_NOT_ALLOWED' },
  TOO_MANY_REQUESTS: { httpStatus: 429, code: 7, message: 'ERROR.TOO_MANY_REQUESTS' },
  FORBIDDEN: { httpStatus: 403, code: 10, message: 'ERROR.FORBIDDEN' },
  FAILED_TO_CONNECT_TO_THE_DATABASE: {
    httpStatus: 500,
    code: 11,
    message: 'ERROR.FAILED_TO_CONNECT_TO_THE_DATABASE'
  },
  UNPROCESSABLE_ENTITY: { httpStatus: 422, code: 12, message: 'ERROR.UNPROCESSABLE_ENTITY' },
  INVALID_OR_EMPTY_PAYLOAD: {
    httpStatus: 400,
    code: 13,
    message: 'ERROR.INVALID_OR_EMPTY_PAYLOAD'
  },
  API_IS_CURRENTLY_UNDER_MAINTENANCE: {
    httpStatus: 503,
    code: 21,
    message: 'ERROR.API_IS_CURRENTLY_UNDER_MAINTENANCE'
  },
  INVALID_CACHE_CONFIGURATION: {
    httpStatus: 503,
    code: 23,
    message: 'ERROR.INVALID_CACHE_CONFIGURATION'
  },
  INVALID_CREDENTIALS: { httpStatus: 404, code: 100, message: 'ERROR.INVALID_CREDENTIALS' },
  INVALID_TOKEN: { httpStatus: 401, code: 101, message: 'ERROR.INVALID_TOKEN' },
  EXPIRED_TOKEN: { httpStatus: 401, code: 102, message: 'ERROR.EXPIRED_TOKEN' },
  INACTIVE_USER: { httpStatus: 401, code: 103, message: 'ERROR.INACTIVE_USER' },
  USER_NOT_FOUND: { httpStatus: 404, code: 106, message: 'ERROR.USER_NOT_FOUND' },
  INVALID_REQUEST_TOKEN: { httpStatus: 401, code: 109, message: 'ERROR.INVALID_REQUEST_TOKEN' },
  EXPIRED_REQUEST_TOKEN: { httpStatus: 401, code: 110, message: 'ERROR.EXPIRED_REQUEST_TOKEN' },
  INVALID_USER_OTP: { httpStatus: 404, code: 112, message: 'ERROR.INVALID_USER_OTP' },
  AUTH_VALIDATION_ERROR: { httpStatus: 422, code: 114, message: 'ERROR.AUTH_VALIDATION_ERROR' },
  ITEM_NOT_FOUND: { httpStatus: 404, code: 203, message: 'ERROR.ITEM_NOT_FOUND' },
  ITEM_ALREADY_EXISTS: { httpStatus: 409, code: 204, message: 'ERROR.ITEM_ALREADY_EXISTS' },
  FIELD_INVALID: { httpStatus: 400, code: 205, message: 'ERROR.FIELD_INVALID' },
  UNKNOWN_ERROR: { httpStatus: 500, code: 400, message: 'ERROR.UNKNOWN_ERROR' },
  MAIL_ERROR: { httpStatus: 500, code: 500, message: 'ERROR.MAIL_ERROR' },
  STRIPE_ERROR: { httpStatus: 500, code: 501, message: 'ERROR.STRIPE_ERROR' },
  DOCUSIGN_ERROR: { httpStatus: 500, code: 505, message: 'ERROR.DOCUSIGN_ERROR' },
  FILE_NOT_EXISTS: { httpStatus: 400, code: 502, message: 'ERROR.FILE_NOT_EXISTS' },
  STRIPE_CARD_PAYMENT_ERROR: {
    httpStatus: 500,
    code: 503,
    message: 'ERROR.STRIPE_CARD_PAYMENT_ERROR'
  }
});

module.exports = {
  Status,
  Roles,
  ErrorCodes,
  DeviceTypes,
};
