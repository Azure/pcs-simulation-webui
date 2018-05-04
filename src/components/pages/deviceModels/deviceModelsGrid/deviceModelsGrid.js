// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Btn, PcsGrid } from 'components/shared';
import { checkboxParams, deviceModelsColumnDefs, defaultDeviceGridProps } from './deviceModelsGridConfig';
import { isFunc, svgs, translateColumnDefs } from 'utilities';
import { EditDeviceModel } from '../flyouts';

const editDeviceModelFlyout = 'edit-device-model';
const EDIT_FLYOUT   = 'edit-flyout';
const DELETE_FLYOUT = 'delete-flyout';
const CLONE_FLYOUT  = 'clone-flyout';

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
      <Btn key="delete" svg={svgs.trash} onClick={this.openFlyout(DELETE_FLYOUT)}>{props.t('deviceModels.flyouts.delete.apply')}</Btn>,
      <Btn key="edit" svg={svgs.edit} onClick={this.openFlyout(EDIT_FLYOUT)}>Edit</Btn>,
      <Btn key="clone" svg={svgs.copy} onClick={this.openFlyout(DELETE_FLYOUT)}>Clone</Btn>
    ];
  }

  openFlyout = (flyoutName) => () => this.setState({ openFlyoutName: flyoutName });

  getOpenFlyout = (t, createDeviceModel, deleteDeviceModel) => {
    switch (this.state.openFlyoutName) {
      case EDIT_FLYOUT:
        return(
            <EditDeviceModel
              onClose={this.closeFlyout}
              deviceModels={this.deviceModelsGridApi.getSelectedRows()}
              t={t} />
          );
      case DELETE_FLYOUT:
      case CLONE_FLYOUT:
      default:
        return null;
    }
  }

  closeFlyout = () => this.setState(closedFlyoutState);

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

  /**
   * Get the ID of the selected item
   */

  render() {
    const { t, createDeviceModel, deleteDeviceModel } = this.props;
    const gridProps = {
      /* Grid Properties */
      ...defaultDeviceGridProps,
      columnDefs: translateColumnDefs(this.props.t, this.columnDefs),
      onRowDoubleClicked: ({ node }) => node.setSelected(!node.isSelected()),
      ...this.props, // Allow default property overrides
      t: this.props.t,
      /* Grid Events */
      onSoftSelectChange: this.onSoftSelectChange,
      onHardSelectChange: this.onHardSelectChange,
      onGridReady: this.onGridReady,
    };

    // Determine which flyout to add to the visual tree
    const editDeviceModelFlyoutOpen = this.state.flyoutOpen === editDeviceModelFlyout;

    return ([
      <PcsGrid {...gridProps} key="device-models-grid-key" />,
      this.getOpenFlyout(t, createDeviceModel, deleteDeviceModel)
    ]);
  }
}
