// Copyright (c) Microsoft. All rights reserved.

import dot from 'dot-object';

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Returns true if the value is defined */
export const isDef = (val) => typeof val !== 'undefined';

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

/** Takes an object and converts it to another structure using dot-notation */
export const reshape = (response, model) => {
  return Object.keys(model).reduce((acc, key) => dot.copy(key, model[key], response, acc), {});
};

/** Returns either Items or items from the given object, allowing for either casing from the server */
export const getItems = (response) => response.Items || response.items || [];
