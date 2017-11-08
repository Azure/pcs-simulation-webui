export const ROUTE_EVENT = 'ROUTE_EVENT';
export const ROUTE_CHANGE = 'ROUTE_CHANGE';
export const START_TIMER = 'START_TIMER';
export const TIMER_TICK = 'TIMER_TICK';

export function routeEvent(pathname) {
  return { type: ROUTE_EVENT, pathname };
}

export function routeChange(pathname) {
  return { type: ROUTE_CHANGE, pathname };
}

export function startTimer() {
  return { type: START_TIMER };
}

export function tickTimer(seconds) {
  return { type: TIMER_TICK, seconds };
}