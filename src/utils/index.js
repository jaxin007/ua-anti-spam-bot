const fs = require('fs');

const { env } = require('typed-dotenv').config();

const { MessageUtil } = require('./message.util');
const { TelegramUtil } = require('./telegram.util');
const errorUtilExports = require('./error.util');
const errorHandlerExports = require('./error-handler');

const messageUtil = new MessageUtil();
const telegramUtil = new TelegramUtil();

function joinMessage(messages) {
  return messages.join('\n');
}

/**
 * @param {GrammyContext} ctx
 * */
function logCtx(ctx) {
  if (env.DEBUG) {
    /**
     * @type {GrammyContext}
     * */
    const writeCtx = JSON.parse(JSON.stringify(ctx));
    // noinspection JSConstantReassignment
    delete writeCtx.tg;
    console.info(JSON.stringify(writeCtx, null, 2));

    fs.writeFileSync('./last-ctx.json', `${JSON.stringify(writeCtx, null, 2)}\n`);
  }
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function truncateString(str, num) {
  if (str.length > num) {
    return `${str.slice(0, num)}..`;
  }

  return str;
}

/**
 * @param {Date} date
 * */
function formatDate(date) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Europe/Kiev' }).format(date);
}

/**
 * @template T
 *
 * @param {T[]} array
 * @returns {T} - random item from array
 * */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * @param {GrammyContext} ctx
 * @param {string} reason
 * @param {any} [extra]
 * */
function logSkipMiddleware(ctx, reason, extra) {
  if (env.DEBUG) {
    console.info(`Skip due to ${reason} in chat ${ctx.chat.title}`, extra);
  }
}

module.exports = {
  logSkipMiddleware,
  joinMessage,
  logCtx,
  sleep,
  truncateString,
  formatDate,
  getRandomItem,
  messageUtil,
  telegramUtil,
  ...errorHandlerExports,
  ...errorUtilExports,
};
