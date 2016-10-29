export enum MessageType {
  ERROR = 0,

  PING = 1,
  PONG = 2,

  HANDSHAKE_REQUEST = 3,
  HANDSHAKE_RESPONSE = 4,

  PASSWORD_AUTH_REQUEST = 5,
  TOKEN_AUTH_REQUEST = 6,
  AUTHENTICATE_RESPONSE = 7,

  OPEN_REAL_TIME_MODEL_REQUEST = 8,
  OPEN_REAL_TIME_MODEL_RESPONSE = 9,

  CLOSES_REAL_TIME_MODEL_REQUEST = 10,
  CLOSE_REAL_TIME_MODEL_RESPONSE = 11,

  CREATE_REAL_TIME_MODEL_REQUEST = 12,
  CREATE_REAL_TIME_MODEL_RESPONSE = 13,

  DELETE_REAL_TIME_MODEL_REQUEST = 14,
  DELETE_REAL_TIME_MODEL_RESPONSE = 15,

  FORCE_CLOSE_REAL_TIME_MODEL = 16,

  REMOTE_CLIENT_OPENED = 17,
  REMOTE_CLIENT_CLOSED = 18,

  MODEL_DATA_REQUEST = 19,
  MODEL_DATA_RESPONSE = 20,

  REMOTE_OPERATION = 21,
  OPERATION_SUBMISSION = 22,
  OPERATION_ACKNOWLEDGEMENT = 23,

  PUBLISH_REFERENCE = 24,
  SET_REFERENCE = 25,
  CLEAR_REFERENCE = 26,
  UNPUBLISH_REFERENCE = 27,

  REFERENCE_PUBLISHED = 28,
  REFERENCE_SET = 29,
  REFERENCE_CLEARED = 30,
  REFERENCE_UNPUBLISHED = 31,

  USER_LOOKUP_REQUEST = 50,
  USER_SEARCH_REQUEST = 51,
  USER_LIST_RESPONSE = 52,

  ACTIVITY_PARTICIPANTS_REQUEST = 60,
  ACTIVITY_PARTICIPANTS_RESPONSE = 61,

  ACTIVITY_JOIN_REQUEST = 64,
  ACTIVITY_JOIN_RESPONSE = 65,

  ACTIVITY_LEAVE_REQUEST = 66,
  ACTIVITY_LEAVE_RESPONSE = 67,

  ACTIVITY_SESSION_JOINED = 68,
  ACTIVITY_SESSION_LEFT = 69,

  ACTIVITY_LOCAL_STATE_SET = 70,
  ACTIVITY_LOCAL_STATE_REMOVED = 71,
  ACTIVITY_LOCAL_STATE_CLEARED = 72,

  ACTIVITY_REMOTE_STATE_SET = 73,
  ACTIVITY_REMOTE_STATE_REMOVED = 74,
  ACTIVITY_REMOTE_STATE_CLEARED = 75,

  PRESENCE_SET_STATE = 76,
  PRESENCE_CLEAR_STATE = 77,

  PRESENCE_STATE_SET = 78,
  PRESENCE_STATE_CLEARED = 79,

  PRESENCE_AVAILABILITY_CHANGED = 80,

  PRESENCE_REQUEST = 81,
  PRESENCE_RESPONSE = 82,

  PRESENCE_SUBSCRIBE_REQUEST = 83,
  PRESENCE_SUBSCRIBE_RESPONSE = 84,
  PRESENCE_UNSUBSCRIBE = 85,

  JOIN_ROOM_REQUEST = 86,
  JOIN_ROOM_RESPONSE = 87,
  LEAVE_ROOM = 88,
  PUBLISH_CHAT_MESSAGE = 89,

  USER_JOINED_ROOM = 90,
  USER_LEFT_ROOM = 91,
  CHAT_MESSAGE_PUBLISHED = 92,

  MODELS_QUERY_REQUEST = 93,
  MODELS_QUERY_RESPONSE = 94,

  HISTORICAL_DATA_REQUEST = 95,
  HISTORICAL_DATA_RESPONSE = 96,

  HISTORICAL_OPERATIONS_REQUEST = 97,
  HISTORICAL_OPERATIONS_RESPONSE = 98,
}
