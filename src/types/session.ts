import { Chat } from 'typegram/manage';

export interface ChatSessionFlavor<S> {
  /**
   * Session data on the context object.
   *
   * **WARNING:** You have to make sure that your session data is not
   * undefined by _providing an initial value to the session middleware_, or by
   * making sure that `ctx.session` is assigned if it is empty! The type
   * system does not include `| undefined` because this is really annoying to
   * work with.
   *
   *  Accessing `ctx.session` by reading or writing will throw if
   * `getSessionKey(ctx) === undefined` for the respective context object
   * `ctx`.
   */
  get chatSession(): S;
  set chatSession(session: S | null | undefined);
}

export interface SessionData {
  isCurrentUserAdmin: boolean;
}

export interface ChatSessionData {
  chatType: Chat['type'];
  chatTitle?: string;
  botRemoved: boolean;
  isBotAdmin: boolean;
  botAdminDate: Date;
}

export interface Session {
  id: string;
  data: SessionData;
}

export interface SessionObject {
  sessions: Session[];
}
