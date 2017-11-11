// Copyright (c) Microsoft. All rights reserved.

// Epic actions trigger redux-observable epics

// Action types
export const ROUTE_EVENT = 'ROUTE_EVENT';
export const ROUTE_CHANGE = 'ROUTE_CHANGE';

// Actions
export function routeEvent(pathname) {
  return { type: ROUTE_EVENT, pathname };
}

export function routeChange(pathname) {
  return { type: ROUTE_CHANGE, pathname };
}
