// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { DeviceModelsGrid } from './deviceModelsGrid';
import { Btn, PageContent, ContextMenu } from 'components/shared';
import { NewDeviceModel } from './flyouts';
import { svgs } from 'utilities';

import './deviceModels.css';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

const newDeviceModelFlyout = 'new-device-model';

export class DeviceModels extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...closedFlyoutState,
      contextBtns: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPending && nextProps.isPending !== this.props.isPending) {
      // If the grid data refreshes, hide the flyout and deselect soft selections
      this.setState(closedFlyoutState);
    }
  }

  closeFlyout = () => this.setState(closedFlyoutState);

  openNewDeviceModelFlyout = () => this.setState({ flyoutOpen: newDeviceModelFlyout });

  onSoftSelectChange = ({ id }) => this.setState({
    flyoutOpen: true,
    selectedDeviceModelId: id
  });

  onContextMenuChange = contextBtns => this.setState({
    contextBtns,
    flyoutOpen: false
  });

  getSoftSelectId = ({ id }) => id;

  render() {
    const { t, deviceModels, createDeviceModel, deleteDeviceModel } = this.props;
    const gridProps = {
      rowData: deviceModels || [],
      onSoftSelectChange: this.onSoftSelectChange,
      onContextMenuChange: this.onContextMenuChange,
      softSelectId: this.state.selectedDeviceId,
      getSoftSelectId: this.getSoftSelectId,
      deleteDeviceModel,
      t
    };
    const newDeviceModelFlyoutOpen = this.state.flyoutOpen === newDeviceModelFlyout;

    return [
      <ContextMenu key="context-menu">
        { this.state.contextBtns }
        <Btn svg={svgs.plus} onClick={this.openNewDeviceModelFlyout}>{t('deviceModels.title')}</Btn>
      </ContextMenu>,
      <PageContent className="devicemodels-container" key="page-content">
        <DeviceModelsGrid {...gridProps} />
        { newDeviceModelFlyoutOpen && <NewDeviceModel onClose={this.closeFlyout}  t={t} createDeviceModel={createDeviceModel}/>}
      </PageContent>
    ];
  }
}
