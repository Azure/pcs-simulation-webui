// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import * as actions from 'actions';

/** Listen to route events and emit a route change event when the url changes */
export const detectRouteChange = action$ => {
  return action$
    .ofType(actions.ROUTE_EVENT)
    .distinctUntilChanged((a, b) => a.pathname === b.pathname)
    .map(({ pathname }) => actions.routeChange(pathname));
};

