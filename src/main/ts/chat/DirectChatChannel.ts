import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {IChatEvent} from "./events/";

export class DirectChatChannel extends ChatChannel {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              messageStream: Observable<IChatEvent>,
              info: ChatChannelInfo) {
    super(connection, messageStream, info);
  }

  public info(): DirectChatChannelInfo {
    const info = super.info();
    const otherUsers = info.members.filter(username => username !== this.session().username());
    return {...info, otherUsers};
  }
}

export interface DirectChatChannelInfo extends ChatChannelInfo {
  readonly otherUsers: string[];
}
