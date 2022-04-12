const helpMiddlewareExports = require('./help.middleware');
const sessionMiddlewareExports = require('./session.middleware');
const startMiddlewareExports = require('./start.middleware');
const statisticsMiddlewareExports = require('./statistics.middleware');
const UpdatesMiddleware = require('./updates.middleware');

module.exports = {
  ...helpMiddlewareExports,
  ...sessionMiddlewareExports,
  ...startMiddlewareExports,
  ...statisticsMiddlewareExports,
  ...UpdatesMiddleware,
};
