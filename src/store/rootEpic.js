// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { epics as appEpics } from './reducers/appReducer';
import { epics as simulationEpics } from './reducers/simulationReducer';

// Extract the epic function from each property object
const epics = Object.values({
  ...appEpics,
  ...simulationEpics
}).map(({ epic }) => epic);

const rootEpic = combineEpics(...epics);

export default rootEpic;
