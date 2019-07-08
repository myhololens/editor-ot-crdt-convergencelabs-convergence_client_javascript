import {DomainUser} from "../identity";
import {Immutable} from "../util/Immutable";

export interface ChatHistoryEntryTypes {
  CREATED: string;
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
  NAME_CHANGED: string;
  TOPIC_CHANGED: string;
}

export abstract class ChatHistoryEntry {

  public static readonly TYPES: ChatHistoryEntryTypes = {
    CREATED: "created",
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    USER_ADDED: "user_added",
    USER_REMOVED: "user_removed",
    NAME_CHANGED: "name_changed",
    TOPIC_CHANGED: "topic_changed"
  };

  /**
   * @hidden
   * @internal
   */
  protected constructor(public readonly type: string,
                        public readonly chatId: string,
                        public readonly eventNumber: number,
                        public readonly timestamp: Date,
                        public readonly user: DomainUser) {
  }
}

Immutable.make(ChatHistoryEntry.TYPES);

export class ChannelCreatedHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "created";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly name: string,
              public readonly topic: string,
              public readonly members: DomainUser[]) {
    super(ChannelCreatedHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class MessageChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "message";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly message: string) {
    super(MessageChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_joined";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserJoinedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class UserLeftChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_left";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserLeftChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class UserAddedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_added";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly addedUser: DomainUser) {
    super(UserAddedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class UserRemovedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_removed";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly removedUser: DomainUser) {
    super(UserRemovedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "name_changed";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly name: string) {
    super(NameChangedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

export class TopicChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "topic_changed";

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly topic: string) {
    super(TopicChangedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}
