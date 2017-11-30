// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';
import { createAction } from 'utilities';

// A collection of helper objects for reducing redux/redux-observable boilerplate

function handleUncaughtError(type) {
  return error => {
    // Capture any uncaught errors to avoid causing the epic stream to fail
    console.error(`Uncaught error in epic "${type}":`, error);
    return Observable.empty();
  }
}

function chooseEpicParam(type, epic, rawEpic) {
  if (rawEpic) {
    return (action$, store) => rawEpic(action$, store, type).catch(handleUncaughtError(type));
  } else if (epic) {
    return (action$, store) =>
      action$.ofType(type)
        .flatMap(action => epic(action, store, action$))
        .catch(handleUncaughtError(type));
  }
}

/** A helper function creating epic scenarios */
export function createEpicScenario(params) {
  if (!params.type || (!params.epic && !params.rawEpic)) {
    throw new Error('Error in createEpicScenario: "type" and "epic" are required parameters');
  }
  const type = `EPIC_${params.type}`;
  const action = createAction(type, params.payload);
  const epic = chooseEpicParam(type, params.epic, params.rawEpic);
  return { type, action, epic };
}

/** A helper function for creating reducer case property objects */
function createReducerCase(params) {
  if (!params.type || !params.reducer) {
    throw new Error('Error in createReduxScenario: "type" and "reducer" are required parameters');
  }
  const type = `REDUX_${params.type}`;
  const action = createAction(type, params.payload);
  const reducer = params.reducer
  return { type, action, reducer };
}

/** A helper function creating reducers from reducer cases */
export function createReducerScenario(cases = {}) {
  // A mapping from scenario names to its reducer properties
  const reducerCases = Object.keys(cases)
    .reduce((acc, key) => ({ ...acc, [key]: createReducerCase(cases[key]) }), {});
  // A mapping from action type strings to their reducers
  const actionReducers = Object.keys(reducerCases)
    .reduce((acc, key) => {
      const { type, reducer } = reducerCases[key];
      return { ...acc, [type]: reducer };
    }, {});
  // The full reducer for the scenario
  const getReducer = (initialState = {}) => (state = initialState, action) => {
    if (action.type in actionReducers) {
      return actionReducers[action.type](state, action);
    }
    return state;
  };
  return { ...reducerCases, getReducer };
}
