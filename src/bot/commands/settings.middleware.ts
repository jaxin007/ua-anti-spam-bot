import {
  airAlarmAlertButton,
  airAlarmNotificationMessage,
  blockWhenAlarm,
  deleteMessageButton,
  deleteSwindlerButton,
  deleteTensorButton,
  getAirRaidAlarmSettingsMessage,
  getSettingsMenuMessage,
  goBackButton,
  selectYourState,
  settingsSubmitMessage,
  turnOffChatWhileAlarmButton,
} from '../../message';
import { alarmChatService } from '../../services';
import type { GrammyContext, GrammyMiddleware, State } from '../../types';
import { handleError } from '../../utils';
import { onlyAdmin } from '../middleware';
import { MiddlewareMenu } from '../middleware-menu.menu';

import { dynamicLocationMenu } from './air-raid-alarm/locations-menu-generator';

const toggleSetting = (context: GrammyContext, key: string) => {
  context.chatSession.chatSettings[key] = context.chatSession.chatSettings[key] === false;
  const newText = getSettingsMenuMessage(context.chatSession.chatSettings);

  if (context.msg?.text !== newText) {
    context.editMessageText(newText, { parse_mode: 'HTML' }).catch(handleError);
  }
};

const isStateSelected = (context: GrammyContext) => {
  const { state } = context.chatSession.chatSettings.airRaidAlertSettings;
  if (!state) {
    context
      .answerCallbackQuery({
        text: selectYourState,
        show_alert: true,
      })
      .catch(handleError);
    return false;
  }
  return true;
};

const isAlarmNow: GrammyMiddleware = (context, next) => {
  const isAlarm = alarmChatService.isAlarmNow(context.chatSession.chatSettings.airRaidAlertSettings.state || '');
  if (isAlarm) {
    context
      .answerCallbackQuery({
        text: blockWhenAlarm,
        show_alert: true,
      })
      .catch(handleError);
  } else {
    return next();
  }
};

export class SettingsMiddleware {
  /**
   * @param {State[]} airRaidAlarmStates
   * */
  settingsMenuObj: MiddlewareMenu | null;

  settingsDescriptionObj: MiddlewareMenu | null;

  settingsAirRaidAlertObj: MiddlewareMenu | null;

  constructor(private airRaidAlarmStates: State[]) {
    this.settingsMenuObj = null;
    this.settingsDescriptionObj = null;
    this.settingsAirRaidAlertObj = null;
  }

  initMenu() {
    /**
     * @param {GrammyContext} context
     * @param {keyof ChatSessionData['chatSettings']} key
     * */

    this.settingsMenuObj = new MiddlewareMenu('settingsMenu', { autoAnswer: false })
      .addGlobalMiddlewares(onlyAdmin)
      .text(deleteTensorButton, (context) => toggleSetting(context, 'disableStrategicInfo'))
      .text(deleteMessageButton, (context) => toggleSetting(context, 'disableDeleteMessage'))
      .text(deleteSwindlerButton, (context) => toggleSetting(context, 'disableSwindlerMessage'))
      .row()
      .text(airAlarmAlertButton, isAlarmNow, (context) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.menu.nav('settingsAirRaidAlertSubmenu');
        context
          .editMessageText(getAirRaidAlarmSettingsMessage(context.chatSession.chatSettings), { parse_mode: 'HTML' })
          .catch(handleError);
      })
      .text(airAlarmNotificationMessage, isAlarmNow, (context) => {
        if (isStateSelected(context)) {
          context.chatSession.chatSettings.airRaidAlertSettings.notificationMessage =
            !context.chatSession.chatSettings.airRaidAlertSettings.notificationMessage;
          alarmChatService.updateChat(context.chatSession, context.chat?.id);
          const newText = getSettingsMenuMessage(context.chatSession.chatSettings);

          if (context.msg?.text !== newText) {
            context.editMessageText(newText, { parse_mode: 'HTML' }).catch(handleError);
          }
        }
      })
      .text(turnOffChatWhileAlarmButton, isAlarmNow, (context) => {
        if (isStateSelected(context)) {
          toggleSetting(context, 'disableChatWhileAirRaidAlert');
          alarmChatService.updateChat(context.chatSession, context.chat?.id);
        }
      })
      // TODO UABOT-2 COMMENT UNTIL DESCRIPTION WILL BE AVAILABLE
      // .row()
      // .submenu(settingsDescriptionButton, 'settingsDescriptionSubmenu', (ctx) => {
      //   ctx.editMessageText(detailedSettingsDescription).catch(handleError);
      // })
      .row()
      .text(settingsSubmitMessage, (context) => context.deleteMessage());

    return this.settingsMenuObj;
  }

  initAirRaidAlertSubmenu() {
    this.settingsAirRaidAlertObj = new MiddlewareMenu('settingsAirRaidAlertSubmenu')
      .addGlobalMiddlewares(onlyAdmin)
      .dynamic((context, range) => dynamicLocationMenu(context, range, this.airRaidAlarmStates))
      .row()
      .back(goBackButton, (context) => {
        context.editMessageText(getSettingsMenuMessage(context.chatSession.chatSettings), { parse_mode: 'HTML' }).catch(handleError);
      });

    return this.settingsAirRaidAlertObj;
  }

  initDescriptionSubmenu() {
    this.settingsDescriptionObj = new MiddlewareMenu('settingsDescriptionSubmenu')
      .addGlobalMiddlewares(onlyAdmin)
      .back(goBackButton, (context) => {
        context.editMessageText(getSettingsMenuMessage(context.chatSession.chatSettings), { parse_mode: 'HTML' }).catch(handleError);
      });

    return this.settingsDescriptionObj;
  }

  sendSettingsMenu(): GrammyMiddleware {
    /**
     * @param {GrammyContext} context
     * */

    return async (context) => {
      if (this.settingsMenuObj) {
        await context
          .replyWithHTML(getSettingsMenuMessage(context.chatSession.chatSettings), { reply_markup: this.settingsMenuObj })
          .catch((error: Error) => {
            console.info(`sendSettingsMenu error ${error.message}`);
          });
      }
    };
  }
}
