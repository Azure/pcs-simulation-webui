// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Btn, PcsGrid } from 'components/shared';
import { devicesColumnDefs, defaultDeviceGridProps } from './devicesGridConfig';
import { isFunc, svgs, translateColumnDefs } from 'utilities';
import { checkboxColumn } from 'components/shared/pcsGrid/pcsGridConfig';
import { Filter, Jobs } from '../flyouts';

const FILTER_FLYOUT   = 'filter-flyout';
const JOBS_FLYOUT = 'jobs-flyout';

const closedFlyoutState = { openFlyoutName: undefined };

/**
 * A grid for displaying devices
 *
 * Encapsulates the PcsGrid props
 */
export class DevicesGrid extends Component {
  constructor(props) {
    super(props);

    // Set the initial state
    this.state = closedFlyoutState;

    // Default device grid columns
    this.columnDefs = [
      checkboxColumn,
      devicesColumnDefs.id,
      devicesColumnDefs.enabled,
      devicesColumnDefs.tags,
      devicesColumnDefs.properties,
    ];

    // TODO: This is a temporary example implementation. Remove with a better version
    this.contextBtns = [
      // <Btn key="filters" svg={svgs.trash} onClick={this.openFlyout(FILTER_FLYOUT)}>{props.t('devices.flyouts.filter.title')}</Btn>,
      <Btn key="jobs" svg={svgs.edit} onClick={this.openFlyout(JOBS_FLYOUT)}>{props.t('devices.flyouts.jobs.title')}</Btn>
    ];
  }

  openFlyout = (flyoutName) => () => this.setState({ openFlyoutName: flyoutName });

  getOpenFlyout = ({ t }) => {
    if (!isFunc((this.devicesGridApi || {}).getSelectedRows)) return;

    const devices = this.devicesGridApi.getSelectedRows() || [];
    const flyoutProps = {
      t,
      devices,
      onClose: this.closeFlyout
    };

    switch (this.state.openFlyoutName) {
      case FILTER_FLYOUT:
        return <Filter key="filter-flyout" { ...flyoutProps } />;
      case JOBS_FLYOUT:
        return <Jobs key="jobs-flyout" { ...flyoutProps } />;
      default:
        return null;
    }
  }

  closeFlyout = () => this.setState(closedFlyoutState);

  /**
   * Get the grid api options
   *
   * @param {Object} gridReadyEvent An object containing access to the grid APIs
   */
  onGridReady = gridReadyEvent => {
    this.devicesGridApi = gridReadyEvent.api;
    gridReadyEvent.api.sizeColumnsToFit();
    // Call the onReady props if it exists
    if (isFunc(this.props.onGridReady)) {
      this.props.onGridReady(gridReadyEvent);
    }
  };

  /**
   * Handles soft select props method
   *
   * @param devices The currently soft selected devices
   * @param rowEvent The rowEvent to pass on to the underlying grid
   */
  onSoftSelectChange = (device, rowEvent) => {
    const { onSoftSelectChange } = this.props;
    this.setState(closedFlyoutState);
    if (isFunc(onSoftSelectChange)) {
      onSoftSelectChange(device, rowEvent);
    }
  }

  /**
   * Handles context filter changes and calls any hard select props method
   *
   * @param {Array} selectedDevices A list of currently selected devices
   */
  onHardSelectChange = (selectedDevices) => {
    const [{ id } = {}] = selectedDevices;
    const { onContextMenuChange, onHardSelectChange } = this.props;
    this.setState({ hardSelectedDeviceId: id });
    if (isFunc(onContextMenuChange)) {
      onContextMenuChange(selectedDevices.length > 0
        ? this.contextBtns
        : null);
    }
    if (isFunc(onHardSelectChange)) {
      onHardSelectChange(selectedDevices);
    }
  }

  /**
   * Get the ID of the selected item
   */

  render() {
    const { t } = this.props;
    const gridProps = {
      /* Grid Properties */
      ...defaultDeviceGridProps,
      columnDefs: translateColumnDefs(this.props.t, this.columnDefs),
      onRowDoubleClicked: ({ node }) => node.setSelected(!node.isSelected()),
      ...this.props, // Allow default property overrides
      context: { t },
      /* Grid Events */
      onSoftSelectChange: this.onSoftSelectChange,
      onHardSelectChange: this.onHardSelectChange,
      onGridReady: this.onGridReady,
    };
    return ([
      <PcsGrid {...gridProps} key="devices-grid-key" />,
      this.getOpenFlyout(this.props)
    ]);
  }
}
