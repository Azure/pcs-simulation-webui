// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { gridValueFormatters } from 'components/shared/pcsGrid/pcsGridConfig';

const { checkForEmpty } = gridValueFormatters;

/* Get data points from message schema */
const toDataPoints = value => value.reduce((prev, cur) => {
  const { MessageSchema: { Fields = {} } } = cur;
  return [
    ...prev,
    ...Object.keys(Fields).filter(key => !key.includes('_'))
  ]
}, []).join('; ');

export const checkboxParams = {
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: true,
  checkboxSelection: true
};

/** A collection of column definitions for the device models grid */
export const deviceModelsColumnDefs = {
  id: {
    headerName: 'deviceModels.grid.id',
    field: 'id',
    sort: 'asc'
  },
  name: {
    headerName: 'deviceModels.grid.modelName',
    field: 'name',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  description: {
    headerName: 'deviceModels.grid.description',
    field: 'description',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  dataPoints: {
    headerName: 'deviceModels.grid.dataPoints',
    field: 'telemetry',
    valueFormatter: ({ value }) => toDataPoints(value)
  },
  version: {
    headerName: 'deviceModels.grid.version',
    field: 'version',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  type: {
    headerName: 'deviceModels.grid.type',
    field: 'type',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
};

/** Given a deviceModel object, extract and return the device Id */
export const getSoftSelectId = ({ Id }) => Id;

/** Shared deviceModel grid AgGrid properties */
export const defaultDeviceModelGridProps = {
  enableColResize: false,
  multiSelect: false,
  pagination: true,
  paginationPageSize: Config.paginationPageSize,
  rowSelection: 'single'
};
