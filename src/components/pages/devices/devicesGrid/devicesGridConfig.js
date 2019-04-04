// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { gridValueFormatters, EMPTY_FIELD_VAL } from 'components/shared/pcsGrid/pcsGridConfig';
import { BooleanRenderer } from './cellRenderers/booleanRenderer';

const { checkForEmpty } = gridValueFormatters;

export const checkboxParams = {
  checkboxSelection: true,
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: true
};

/** A collection of column definitions for the device s grid */
export const devicesColumnDefs = {
  id: {
    headerName: 'devices.grid.id',
    field: 'id',
    sort: 'asc',
    filter: "agTextColumnFilter",
    filterParams: {
      applyButton: true,
      clearButton: true
    }
  },
  enabled: {
    headerName: 'devices.grid.enabled',
    field: 'enabled',
    valueFormatter: ({ value }) => checkForEmpty(value),
    cellRendererFramework: BooleanRenderer
  },
  tags: {
    headerName: 'devices.grid.tags',
    field: 'tags',
    valueFormatter: ({ value }) => Object.keys(value || {}).join(' ') || EMPTY_FIELD_VAL
  },
  properties: {
    headerName: 'devices.grid.properties',
    field: 'properties',
    valueFormatter: ({ value }) => Object.keys(value || {}).join('; ') || EMPTY_FIELD_VAL
  },
};

/** Given a device object, extract and return the device Id */
export const getSoftSelectId = ({ Id }) => Id;

/** Shared device grid AgGrid properties */
export const defaultDeviceGridProps = {
  enableFilter: true,
  enableColResize: true,
  multiSelect: true,
  pagination: true,
  paginationPageSize: Config.paginationPageSize,
  rowSelection: "multiple",
  rowModelType: "infinite",
  cacheOverflowSize: 2,
  maxConcurrentDatasourceRequests: 2,
  infiniteInitialRowCount: 1,
  maxBlocksInCache: 2,
  suppressRowClickSelection: false
};
