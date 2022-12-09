import type { Chat, ChatFromGetChat, User } from '@grammyjs/types/manage';
import type { ChatMemberOwner } from 'typegram';

import type { GrammyContext } from '../types';

export class TelegramUtil {
  /**
   * @param {GrammyContext} context
   * @returns {boolean}
   * */
  isFromChannel(context: GrammyContext): boolean {
    return context.from?.first_name === 'Channel' && context.from?.username === 'Channel_Bot';
  }

  /**
   * @param {GrammyContext} context
   * @returns {boolean}
   * */
  isInComments(context: GrammyContext): boolean {
    return context.msg?.reply_to_message?.from?.id === 777_000;
  }

  getChatTitle(chat?: Chat): string {
    return (chat && 'title' in chat && chat.title) || '$title';
  }

  getInviteLink(chatInfo: ChatFromGetChat): string | undefined {
    return ('invite_link' in chatInfo && chatInfo.invite_link) || undefined;
  }

  /**
   * @param {GrammyContext} context
   * @param {number} chatId
   */
  getChatAdmins(context: GrammyContext, chatId: number) {
    return context.api.getChatAdministrators(chatId).then((admins) => {
      if (!admins || admins.length === 0) {
        return {};
      }

      const creator = admins.find((user) => user.status === 'creator' && !!user.user.username) as ChatMemberOwner;
      const promoteAdmins = admins.filter((user) => user.status === 'creator' || (user.can_promote_members && !!user.user.username));

      const finalAdmins = [...new Set([creator, ...promoteAdmins].filter(Boolean))];
      const adminsString = finalAdmins.length > 0 ? `${finalAdmins.map((user) => this.getUserMentionOrName(user.user)).join(', ')} ` : '';

      return { creator, admins, promoteAdmins, adminsString, finalAdmins };
    });
  }

  /**
   * @param {User} user
   */
  getUserMentionOrName(user: User): string {
    if (user.username) {
      return `@${user.username}`;
    }
    return `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`;
  }
}
