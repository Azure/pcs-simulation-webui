// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';

// A collection of helper objects for reducing store/redux-observable boilerplate

/**
 * Utility method for generating redux action creators
 */
export const createAction = (type, staticPayload) => {
  const creator = payload => ({ type, payload });
  const useStaticPayload = typeof staticPayload !== 'undefined';
  return useStaticPayload ? () => creator(staticPayload) : creator;
};

/**
 * Capture any uncaught errors to avoid causing the epic stream to fail
 */
function handleUncaughtError(type) {
  return error => {
    console.error(`Uncaught error in epic "${type}":`, error);
    return Observable.empty();
  }
}

/**
 * A helper method for choosing between the epic and rawEpic parameters of the
 * createEpicScenario input
 */
function chooseEpicParam(type, epic, rawEpic) {
  if (rawEpic) {
    return (action$, store) =>
      rawEpic(action$, store, type).catch(handleUncaughtError(type));
  }
  return (action$, store) =>
    action$.ofType(type)
      .flatMap(action => epic(action, store, action$))
      .catch(handleUncaughtError(type));
}

/**
 * A helper function creating epic scenarios
 * An epic scenario consists of three properties
 *  - The action type string
 *  - The action creator
 *  - The epic that handles actions of given type
 */
export function createEpicScenario(params) {
  if (!params.type || (!params.epic && !params.rawEpic)) {
    throw new Error('Error in createEpicScenario: "type" and "epic" are required parameters');
  }

  // The scenario properties
  const type = `EPIC_${params.type}`;
  const action = createAction(type, params.staticPayload);
  const epic = chooseEpicParam(type, params.epic, params.rawEpic);

  return { type, action, epic };
}

/**
 * A helper function for creating reducer case property objects
 * A reducer case consists of three properties
 *  - The action type string
 *  - The action creator
 *  - The reducer that handles actions of given type
 */
function createReducerCase(params) {
  if (!params.type || !params.reducer) {
    throw new Error('Error in createReducerCase: "type" and "reducer" are required parameters');
  }

  // The scenario properties
  const type = `REDUX_${params.type}`;
  const action = createAction(type, params.staticPayload);
  const reducer = params.reducer

  return { type, action, reducer };
}

/**
 * A helper function creating reducers from reducer cases
 * A reducer scenario takes an object of reducer cases and returns
 * an object of reducer case objects and a combined reducer for
 * those cases.
 */
export function createReducerScenario(cases = {}) {
  // A mapping from scenario names to their reducer properties
  const reducerCases = Object.keys(cases)
    .reduce((acc, key) => ({ ...acc, [key]: createReducerCase(cases[key]) }), {});

  // A mapping from action type strings to their reducers
  // Used for fast lookup of action types in the primary reducer method
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
