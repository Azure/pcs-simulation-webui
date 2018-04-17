// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Btn, PcsGrid } from 'components/shared';
import { checkboxParams, deviceModelsColumnDefs, defaultDeviceGridProps } from './deviceModelsGridConfig';
import { isFunc, svgs, translateColumnDefs } from 'utilities';

const closedFlyoutState = { openFlyoutName: undefined };

/**
 * A grid for displaying device models
 *
 * Encapsulates the PcsGrid props
 */
export class DeviceModelsGrid extends Component {
  constructor(props) {
    super(props);

    // Set the initial state
    this.state = closedFlyoutState;

    // Bind to this
    this.closeFlyout = this.closeFlyout.bind(this);
    this.openDeleteFlyout = this.openDeleteFlyout.bind(this);

    // Default device grid columns
    this.columnDefs = [
      { ...deviceModelsColumnDefs.id, ...checkboxParams },
      deviceModelsColumnDefs.name,
      deviceModelsColumnDefs.description,
      deviceModelsColumnDefs.dataPoints,
      deviceModelsColumnDefs.version,
      deviceModelsColumnDefs.type,
    ];

    // TODO: This is a temporary example implementation. Remove with a better version
    this.contextBtns = [
      <Btn key="delete" svg={svgs.trash} onClick={this.openDeleteFlyout}>{props.t('deviceModels.flyouts.delete.apply')}</Btn>,
      <Btn key="edit" svg={svgs.edit}>Edit</Btn>,
      <Btn key="clone" svg={svgs.copy}>Clone</Btn>
    ];
  }

  closeFlyout = () => this.setState(closedFlyoutState);

  openDeleteFlyout = () => this.setState({ openFlyoutName: 'delete' });

  componentWillReceiveProps(nextProps) {
    const { hardSelectedDeviceModels } = nextProps;
    if (!hardSelectedDeviceModels || !this.deviceModelsGridApi) return;
    const deviceModelsIdSet = new Set((hardSelectedDeviceModels || []).map(({ Id }) => Id));

    this.deviceModelsGridApi.forEachNode(node => {
      if (deviceModelsIdSet.has(node.data.Id) && !node.selected) {
        node.setSelected(true);
      }
    });
  }

  /**
   * Get the grid api options
   *
   * @param {Object} gridReadyEvent An object containing access to the grid APIs
   */
  onGridReady = gridReadyEvent => {
    this.deviceModelsGridApi = gridReadyEvent.api;
    gridReadyEvent.api.sizeColumnsToFit();
    // Call the onReady props if it exists
    if (isFunc(this.props.onGridReady)) {
      this.props.onGridReady(gridReadyEvent);
    }
  };

  /**
   * Handles soft select props method
   *
   * @param device The currently soft selected device
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
    const { onContextMenuChange, onHardSelectChange } = this.props;
    if (isFunc(onContextMenuChange)) {
      onContextMenuChange(selectedDevices.length > 0 ? this.contextBtns : null);
    }
    if (isFunc(onHardSelectChange)) {
      onHardSelectChange(selectedDevices);
    }
  }

  render() {
    const gridProps = {
      /* Grid Properties */
      ...defaultDeviceGridProps,
      columnDefs: translateColumnDefs(this.props.t, this.columnDefs),
      onRowDoubleClicked: ({ node }) => node.setSelected(!node.isSelected()),
      ...this.props, // Allow default property overrides
      context: {
        t: this.props.t
      },
      /* Grid Events */
      onSoftSelectChange: this.onSoftSelectChange,
      onHardSelectChange: this.onHardSelectChange,
      onGridReady: this.onGridReady
    };
    const openFlyout = (this.state.openFlyoutName === 'delete')
      ? null // TODO: Pending design <DeviceDeleteContainer key="device-flyout-key" onClose={this.closeFlyout} devices={this.deviceModelsGridApi.getSelectedRows()} />
      : null;
    return ([
      <PcsGrid key="device-models-grid-key" {...gridProps} />,
      openFlyout
    ]);
  }
}
