// Copyright (c) Microsoft. All rights reserved.

import Rx from 'rxjs';
import * as actions from 'actions';

export const resetTimer = action$ => {
  return action$
    .filter(({ type }) => type === actions.START_TIMER || type === actions.ROUTE_CHANGE)
    .switchMap(_ => 
      Rx.Observable
        .interval(1000)
        .startWith(-1)
        .map(val => val + 1)
    )
    .map(actions.tickTimer);
};

export const detectRouteChange = action$ => {
  return action$
    .ofType(actions.ROUTE_EVENT)
    .distinctUntilChanged((a, b) => a.pathname === b.pathname)
    .map(({ pathname }) => actions.routeChange(pathname));
};

