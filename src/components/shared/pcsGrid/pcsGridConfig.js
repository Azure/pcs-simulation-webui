// Copyright (c) Microsoft. All rights reserved.
/* This file contains default values useful for creating PcsGrid */

/** The default value for PcsGrid cells that are empty */
export const EMPTY_FIELD_VAL = '---';

/** The default formatting for dates in the PcsGrid */
export const DEFAULT_TIME_FORMAT = 'hh:mm:ss MM.DD.YYYY';

/** A collection of reusable value formatter methods */
export const gridValueFormatters = {
  checkForEmpty: (value, emptyValue = EMPTY_FIELD_VAL) => value || emptyValue
};

/** A the class name for the first row in a grid (used for soft and hard selection ) */
export const FIRST_COLUMN_CLASS = 'first-child-column';
export const CHECKBOX_COLUMN_CLASS = 'checkbox-column';

export const checkboxColumn = {
  lockPosition: true,
  cellClass: FIRST_COLUMN_CLASS,
  headerClass: CHECKBOX_COLUMN_CLASS,
  suppressResize: true,
  checkboxSelection: true,
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: true,
  suppressMovable: true,
  width: 25
};
