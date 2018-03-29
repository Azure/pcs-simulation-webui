export const logEventModel = (request = {}) => ({
    EventType: request.EventType,
    Timestamp: request.Timestamp,
    EventProperties: request.EventProperties
  });
