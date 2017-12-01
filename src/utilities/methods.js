// Copyright (c) Microsoft. All rights reserved.

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Converts a value to an integer */
export const int = (num) => parseInt(num, 10);

/** Merges css classnames into a single string */
export const joinClasses = (...classNames) => classNames.join(' ').trim();

/** Convert a string of type 'true' or 'false' to its boolean equivalent */
export const stringToBoolean = value => {
  if (typeof value !== 'string') return str;
  const str = value.toLowerCase();
  if (str === "true") return true;
  else if (str === "false") return false;
};
