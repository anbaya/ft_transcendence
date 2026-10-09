export const WS_EVENTS = {
  MESSAGE_NEW: 'message.new',
  NOTIFICATION_CREATED: 'notification.created',
} as const;

export type WSEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];