// Copyright (c) Microsoft. All rights reserved.

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Converts a value to an integer */
export const int = (num) => parseInt(num, 10);

/** Merges css classnames into a single string */
export const joinClasses = (...classNames) => classNames.join(' ').trim();

/** Utility method for generating redux action creators */
export const createAction = (type, staticPayload) => {
  const creator = payload => ({ type, payload });
  const useStaticPayload = typeof staticPayload !== 'undefined';
  return useStaticPayload ? () => creator(staticPayload) : creator;
};

export const stringToBoolean = value => {
  if (typeof value !== 'string') return str;
  const str = value.toLowerCase();
  if (str === "true") return true;
  else if (str === "false") return false;
};
