import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {ActivityJoinRequest} from "../connection/protocol/activity/joinActivity";
import {ActivityLeaveRequest} from "../connection/protocol/activity/leaveActivity";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivitySetState} from "../connection/protocol/activity/activityState";
import {ActivityClearState} from "../connection/protocol/activity/activityState";
import {ActivityParticipant} from "./ActivityParticipant";
import {ParticipantsRequest} from "../connection/protocol/activity/participants";
import {ParticipantsResponse} from "../connection/protocol/activity/participants";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export class Activity extends ConvergenceEventEmitter<ActivityEvent> {

  static Events: any = {
    SESSION_JOINED: "session_joined",
    SESSION_LEFT: "session_left",
    STATE_SET: "state_set",
    STATE_CLEARED: "state_cleared"
  };

  private _id: string;
  private _joinCB: () => void;
  private _leftCB: () => void;
  private _isJoined: () => boolean;
  private _connection: ConvergenceConnection;

  constructor(id: string,
              joinCB: () => void,
              leftCB: () => void,
              isJoined: () => boolean,
              eventStream: Observable<ActivityEvent>,
              connection: ConvergenceConnection) {
    super();
    this._emitFrom(eventStream);
    this._id = id;
    this._joinCB = joinCB;
    this._leftCB = leftCB;
    this._isJoined = isJoined;
    this._connection = connection;
  }

  session(): Session {
    return this._connection.session();
  }

  id(): string {
    return this._id;
  }

  join(options?: ActivityJoinOptions): void {
    if (options === undefined) {
      options = {
        state: new Map<string, any>()
      };
    }

    if (!this._isJoined()) {
      this._connection.send(<ActivityJoinRequest>{
        type: MessageType.ACTIVITY_JOIN_REQUEST,
        activityId: this._id,
        state: options.state
      });
      this._joinCB();
    }
  }

  leave(): void {
    if (this._isJoined()) {
      this._connection.send(<ActivityLeaveRequest>{
        type: MessageType.ACTIVITY_LEAVE_REQUEST,
        activityId: this._id
      });
      this._leftCB();
    }
  }

  isJoined(): boolean {
    return this._isJoined();
  }

  publish(state: Map<string, any>): void
  publish(key: string, value: any): void
  publish(): void {
    var state: Map<string, any>;
    if (arguments.length === 1) {
      state = arguments[0];
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state[arguments[0]] = arguments[1];
    }
    if (this._isJoined()) {
      var message: ActivitySetState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_SET,
        activityId: this._id,
        state: state
      };
      this._connection.send(message);
    }
  }

  clear(key: string): void
  clear(keys: string[]): void
  clear(keys: string | string[]): void {
    if (typeof keys === "string") {
      keys = [<string>keys];
    }

    if (this._isJoined()) {
      var message: ActivityClearState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_CLEARED,
        activityId: this._id,
        keys: <string[]>keys
      };
      this._connection.send(message);
    }
  }

  participants(): Observable<ActivityParticipant[]> {
    var participantRequest: ParticipantsRequest = {
      type: MessageType.ACTIVITY_PARTICIPANTS_REQUEST,
      activityId: this._id
    };

    return Observable.fromPromise(this._connection.request(participantRequest)).map((response: ParticipantsResponse) => {
      var participants: ActivityParticipant[] = [];
      Object.keys(response.participants).forEach((sessionId: string) => {
        var username: string = SessionIdParser.parseUsername(sessionId);
        participants.push(new ActivityParticipant(username, sessionId, <Map<string, any>>response.participants[sessionId]));
      });
      return participants;
    });
  }
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}
