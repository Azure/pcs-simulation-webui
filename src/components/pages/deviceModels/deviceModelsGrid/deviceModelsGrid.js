// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Btn, PcsGrid } from 'components/shared';
import { checkboxParams, deviceModelsColumnDefs, defaultDeviceModelGridProps } from './deviceModelsGridConfig';
import { isFunc, svgs, translateColumnDefs } from 'utilities';
import { EditDeviceModel, CloneDeviceModel } from '../flyouts';
import { deviceModelFormModes } from '../flyouts/views/deviceModelForm'
import { DeleteModal } from '../deleteModal/deleteModal';

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
      <Btn key="clone" svg={svgs.copy} onClick={this.openFlyout(CLONE_FLYOUT)}>Clone</Btn>
    ];
  }

  openFlyout = (flyoutName) => () => this.setState({ openFlyoutName: flyoutName });

  getOpenFlyout = (t, createDeviceModel, deleteDeviceModel, editDeviceModel) => {
    switch (this.state.openFlyoutName) {
      case EDIT_FLYOUT:
        return(
          <EditDeviceModel
            key="edit-device-model-flyout"
            onClose={this.closeFlyout}
            deviceModels={this.deviceModelsGridApi.getSelectedRows()}
            editDeviceModel={editDeviceModel}
            formMode={deviceModelFormModes.FORM_MODE_EDIT}
            t={t} />
          );
      case CLONE_FLYOUT:
        return (
          <CloneDeviceModel
            key="clone-device-model-flyout"
            onClose={this.closeFlyout}
            deviceModels={this.deviceModelsGridApi.getSelectedRows()}
            createDeviceModel={createDeviceModel}
            formMode={deviceModelFormModes.FORM_MODE_CREATE}
            t={t} />
        );
      case DELETE_FLYOUT:
        return (
          <DeleteModal
            key="delete-device-model-modal"
            onClose={this.closeFlyout}
            onDelete={this.onDeleteDeviceModel}
            deviceModelId={this.state.hardSelectedDeviceModelId}
            formMode={deviceModelFormModes.FORM_MODE_DELETE}
            t={t} />
        );
      default:
        return null;
    }
  }

  closeFlyout = () => this.setState(closedFlyoutState);

  onDeleteDeviceModel = () => {
    this.props.deleteDeviceModel(this.state.hardSelectedDeviceModelId);
    this.closeFlyout();
  };

  componentWillReceiveProps(nextProps) {
    const { onContextMenuChange, rowData = [] } = nextProps;
    if (rowData.length !== (this.props.rowData || []).length) {
      if (isFunc(onContextMenuChange)) {
        onContextMenuChange(null);
      }
    }
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
   * @param deviceModel The currently soft selected deviceModel
   * @param rowEvent The rowEvent to pass on to the underlying grid
   */
  onSoftSelectChange = (deviceModel, rowEvent) => {
    const { onSoftSelectChange } = this.props;
    this.setState(closedFlyoutState);
    if (isFunc(onSoftSelectChange)) {
      onSoftSelectChange(deviceModel, rowEvent);
    }
  }

  /**
   * Handles context filter changes and calls any hard select props method
   *
   * @param {Array} selectedDeviceModels A list of currently selected devices
   */
  onHardSelectChange = (selectedDeviceModels) => {
    const [{ id, type } = {}] = selectedDeviceModels;
    const { onContextMenuChange, onHardSelectChange } = this.props;
    this.setState({ hardSelectedDeviceModelId: id });
    if (isFunc(onContextMenuChange)) {
      onContextMenuChange(selectedDeviceModels.length > 0
        ? type === 'StockModel'
            ? this.contextBtns.filter(btn => btn.key !== 'delete')
            : this.contextBtns
        : null);
    }
    if (isFunc(onHardSelectChange)) {
      onHardSelectChange(selectedDeviceModels);
    }
  }

  /**
   * Get the ID of the selected item
   */

  render() {
    const { t, createDeviceModel, deleteDeviceModel, editDeviceModel } = this.props;
    const gridProps = {
      /* Grid Properties */
      ...defaultDeviceModelGridProps,
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
      <PcsGrid {...gridProps} key="device-models-grid-key" />,
      this.getOpenFlyout(t, createDeviceModel, deleteDeviceModel, editDeviceModel)
    ]);
  }
}
