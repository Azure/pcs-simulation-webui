// Copyright (c) Microsoft. All rights reserved.

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Converts a value to an integer */
export const int = (num) => parseInt(num, 10);

/** Merges css classnames into a single string */
export const joinClasses = (...classNames) => classNames.join(' ').trim();
