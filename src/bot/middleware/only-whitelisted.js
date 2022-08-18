const { getDeclinedMassSendingMessage } = require('../../message');
const { isIdWhitelisted } = require('../../utils');

/**
 * @description
 * Allow actions only for whitelisted users
 *
 * @param {GrammyContext} ctx
 * @param {Next} next
 * */
function onlyWhitelisted(ctx, next) {
  if (isIdWhitelisted(ctx.from.id)) {
    return next();
  }

  ctx.reply(getDeclinedMassSendingMessage);
}

module.exports = {
  onlyWhitelisted,
};
