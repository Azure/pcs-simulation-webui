// Copyright (c) Microsoft. All rights reserved.

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Tests if a value is an object */
export const isObject = value => typeof value === 'object';

/** Converts a value to an integer */
export const int = (num) => parseInt(num, 10);

/** Merges css classnames into a single string */
export const joinClasses = (...classNames) => classNames.filter(name => !!name).join(' ').trim();

/** Convert a string of type 'true' or 'false' to its boolean equivalent */
export const stringToBoolean = value => {
  if (typeof value !== 'string') return value;
  const str = value.toLowerCase();
  if (str === "true") return true;
  else if (str === "false") return false;
};

/** A helper method for translating headerNames of columnDefs */
export const translateColumnDefs = (t, columnDefs) => {
  return columnDefs.map(columnDef =>
    columnDef.headerName
      ? { ...columnDef, headerName: t(columnDef.headerName) }
      : columnDef
  );
}
