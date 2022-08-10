const { Menu } = require('@grammyjs/menu');
const Bottleneck = require('bottleneck');

const { redisService } = require('../../services/redis.service');
const { getUpdatesMessage, getSuccessfulMessage, cancelMessageSending, confirmationMessage, getUpdateMessage } = require('../../message');
const { handleError } = require('../../utils');

class UpdatesMiddleware {
  constructor() {
    this.menu = null;
  }

  initMenu() {
    this.menu = new Menu('approveUpdatesMenu')
      .text({ text: 'Підтвердити ✅', payload: 'approve' })
      .row()
      .text({ text: 'Відмінити ⛔️', payload: 'cancel' });

    return this.menu;
  }

  initialization() {
    /**
     * @param {GrammyContext} ctx
     * */
    return (ctx) => {
      ctx.session.step = 'confirmation';
      ctx.replyWithHTML(getUpdatesMessage());
    };
  }

  confirmation() {
    /**
     * @param {GrammyContext} ctx
     * */
    const middleware = async (ctx) => {
      const userInput = ctx.msg?.text;
      const textEntities = ctx.msg?.entities;
      ctx.session.updatesText = userInput;
      ctx.session.textEntities = textEntities ?? null;
      ctx.session.step = 'messageSending';
      await ctx.replyWithChatAction('typing');
      const sessions = (await redisService.getChatSessions()).filter(
        (session) => session.data.chatType === 'private' || session.data.chatType === 'supergroup',
      );

      await ctx.reply(`${confirmationMessage}\nВсього чатів: ${sessions.length}`);
      await ctx.reply(userInput, { entities: textEntities ?? null, reply_markup: this.menu });
    };

    return middleware;
  }

  messageSending() {
    /**
     * @param {GrammyContext} ctx
     * */
    return async (ctx) => {
      ctx.session.step = 'idle';
      const payload = ctx.match;
      if (payload === 'approve') {
        const limiter = new Bottleneck({
          maxConcurrent: 1,
          minTime: 2000,
        });

        const updatesMessage = ctx.session.updatesText;
        const updatesMessageEntities = ctx.session.textEntities;
        const sessions = await redisService.getChatSessions();
        const privateAndSuperGroupsSessions = sessions.filter(
          (session) => session.data.chatType === 'private' || session.data.chatType === 'supergroup',
        );
        const totalCount = privateAndSuperGroupsSessions.length;
        const chunkSize = Math.ceil(totalCount / 10);
        let finishedCount = 0;
        let successCount = 0;

        privateAndSuperGroupsSessions.forEach((e) => {
          limiter.schedule(() => {
            ctx.api
              .sendMessage(e.id, updatesMessage, { entities: updatesMessageEntities ?? null })
              .then(() => {
                successCount += 1;
              })
              .catch(handleError)
              .finally(() => {
                finishedCount += 1;
              });
          });
        });

        limiter.on('done', () => {
          if (finishedCount % chunkSize === 0) {
            ctx.reply(getUpdateMessage({ totalCount, successCount, finishedCount })).catch(handleError);
          }
        });

        limiter.on('empty', () => {
          ctx.reply(getSuccessfulMessage({ totalCount, successCount })).catch(handleError);
        });
      } else {
        await ctx.reply(cancelMessageSending);
      }
    };
  }
}

module.exports = {
  UpdatesMiddleware,
};
