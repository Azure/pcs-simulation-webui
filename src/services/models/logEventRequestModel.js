export const logEventRequestModel = (request = {}) => ({
    EventType: request.eventType,
    Timestamp: request.timestamp,
    EventProperties: request.eventProperties
  });