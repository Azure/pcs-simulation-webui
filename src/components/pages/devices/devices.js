// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { DevicesGrid } from './devicesGrid';
import { Btn, PageContent, ContextMenu, Svg } from 'components/shared';
import { SimulationService } from 'services';
import { Filter } from './flyouts';
import { svgs } from 'utilities';

import './devices.scss';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceId: undefined
};

const defaultFilterState = {
  filters: {}
};

const FILTER_FLYOUT = 'filter-flyout';

const getDeviceList = (simulations = [], deviceModelEntities = {}, filters = {}) => simulations
  .filter(({ isActive }) => isActive)
  .map(({ id: simId, deviceModels, name }) => {
    const { simulation: simulationFilter, deviceModel: deviceModelFilter} = filters;
    if (simulationFilter && name !== simulationFilter) return [];

    return deviceModels
      .filter(({ id }) => (!deviceModelFilter || id === deviceModelFilter))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(({ id, count }) => {
        let deviceIdList = [];
        const deviceModel = deviceModelEntities[id] || {};
        const { properties = {}, cloudToDeviceMethods = {} } = deviceModel;
        for (let i = 1; i <= count; i++) {
          deviceIdList.push({
            id: `${simId}.${id}.${i}`,
            enabled: true,
            tags: { IsSimulated: 'Y' },
            properties,
            cloudToDeviceMethods
          })
        }
        return deviceIdList;
      })
      .reduce((acc, arr) => ([ ...acc, ...arr ]), [])
  })
  .reduce((acc, arr) => ([ ...acc, ...arr ]), []);

export class Devices extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...closedFlyoutState,
      data: [],
      selectedDevices: [],
      ...defaultFilterState,
      contextBtns: null,
      selectAll: false
    };

    this.subscriptions = [];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeFlyout = () => this.setState(closedFlyoutState);

  applyFilters = () => {
    const { deviceModelEntities, simulationList } = this.props;
    const data = getDeviceList(simulationList, deviceModelEntities, this.state.filters);
    const updateData = (data = []) => {
      const dataSource = {
        rowCount: null,
        getRows: (params) => {
          let rowsThisPage = data.slice(params.startRow, params.endRow);
          let lastRow = data.length;
          params.successCallback(rowsThisPage, lastRow);
        }
      };
      this.deviceGridApi.setDatasource(dataSource);
    }
    this.setState(
      { noMatch: data.length === 0 },
      () => updateData(data)
    );
  }

  setFilters = filters => this.setState({ filters }, () => this.applyFilters());

  removeFilter = name => e => {
    this.setState(
      {
        filters: {
          ...this.state.filters,
          [name]: null
        }
      },
      () => this.applyFilters()
    )
  }

  openFilterFlyout = () => this.setState({ flyoutOpen: FILTER_FLYOUT });

  onSoftSelectChange = ({ id }) => this.setState({
    flyoutOpen: true,
    selectedDeviceId: id
  });

  onHardSelectChange = (selectedDevices) => this.setState({ selectedDevices });

  onContextMenuChange = contextBtns => this.setState({
    contextBtns,
    flyoutOpen: false
  });

  getSoftSelectId = ({ id } = {}) => id;

  onGridReady = params => {
    this.deviceGridApi = params.api;
    this.deviceGridColumnApi = params.columnApi;

    const updateData = (data = []) => {
      const dataSource = {
        rowCount: null,
        getRows: (params) => {
          let rowsThisPage = data.slice(params.startRow, params.endRow);
          let lastRow = data.length;
          params.successCallback(rowsThisPage, lastRow);
        }
      };
      params.api.setDatasource(dataSource);
    }

    this.subscriptions.push(SimulationService.getSimulationList().subscribe(
      simulations => {
        const data = getDeviceList(simulations, this.props.deviceModelEntities);
        updateData(data)
      }
    ));
  }

  render() {
    const {
      t,
      deviceModelEntities,
      simulationList
    } = this.props;
    const gridProps = {
      rowData: this.state.data,
      onSoftSelectChange: this.onSoftSelectChange,
      onHardSelectChange: this.onHardSelectChange,
      onContextMenuChange: this.onContextMenuChange,
      softSelectId: this.state.selectedDeviceId,
      getSoftSelectId: this.getSoftSelectId,
      onGridReady: this.onGridReady,
      t
    };
    const filterFlyoutProps = {
      onClose: this.closeFlyout,
      devices: this.state.selectedDevices,
      setFilters: this.setFilters,
      clearFilters: this.clearFilters,
      filters: this.state.filters,
      deviceModelEntities,
      simulationList,
      t
    }
    const filterFlyoutOpen = this.state.flyoutOpen === FILTER_FLYOUT;

    return [
      <ContextMenu key="context-menu">
        { this.state.contextBtns }
        <Btn svg={svgs.plus} onClick={this.openFilterFlyout}>
          { t('devices.flyouts.filter.title') }
        </Btn>
      </ContextMenu>,
      <PageContent className="devices-container" key="page-content">
        <div className="filter-list-container">
        {
          Object.values(this.state.filters).some(value => !!value) &&
          <div>{ t('devices.filters') }</div>
        }
        {
          Object.keys(this.state.filters).map((key, idx) => {
            const value = this.state.filters[key];
            if (!value) return null;

            return <div className="filter-container" key={idx}>
                  {value}
                  <Svg path={svgs.cancelX} className="remove-filter" onClick={this.removeFilter(key)} />
                </div>

          })
        }
        </div>
        {
          this.state.noMatch
            ? <div className="no-match">{ t('devices.noMatch') }</div>
            : <DevicesGrid {...gridProps} />
        }
        {
          filterFlyoutOpen &&
          <Filter {...filterFlyoutProps} />
        }
      </PageContent>
    ];
  }
}
