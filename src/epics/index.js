// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { resetTimer, detectRouteChange } from "./routeEpics";

const rootEpic = combineEpics(
  resetTimer,
  detectRouteChange
);

export default rootEpic;
