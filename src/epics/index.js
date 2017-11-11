// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { detectRouteChange } from "./routeEpics";

const rootEpic = combineEpics(
  detectRouteChange
);

export default rootEpic;
