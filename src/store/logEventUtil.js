// Copyright (c) Microsoft. All rights reserved.

import { now } from 'moment';

export default function diagnosticsEvent(eventType, eventProperties) {
    return {
        eventType: eventType,
        timestamp: now(),
        eventProperties: eventProperties
      };
  }
  