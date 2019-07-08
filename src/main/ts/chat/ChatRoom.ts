import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChat, MembershipChatInfo} from "./MembershipChat";
import {IChatEvent} from "./events/";
import {IdentityCache} from "../identity/IdentityCache";

/**
 * A [[ChatRoom]] is a chat construct where users must be connected and present
 * to receive messages. A chat room does not have members beyond who is in the
 * chat room at any given time. Presence in a chat room is determined by
 * session. If a particular session is not connected and currently in a given
 * room, then messages published to that room will not be delivered to that
 * session.
 */
export class ChatRoom extends MembershipChat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }
}
