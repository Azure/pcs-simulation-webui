// Copyright (c) Microsoft. All rights reserved.

export function isFunc(value) {
  return typeof value === 'function';
}

export const int = (num) => parseInt(num, 10);

export const joinClasses = (...classNames) => classNames.join(' ').trim();
