// Copyright (c) Microsoft. All rights reserved.

// Redux actions trigger updates to the redux store

// Action types
export const TIMER_TICK = 'TIMER_TICK';

// Actions
export function tickTimer(seconds) {
  return { type: TIMER_TICK, seconds };
}
