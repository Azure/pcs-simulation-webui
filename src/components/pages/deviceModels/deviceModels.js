// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { DeviceModelsGrid } from './deviceModelsGrid';
import { Btn, RefreshBar, PageContent, ContextMenu } from 'components/shared';
import { NewDeviceModel } from './flyouts';
import { svgs } from 'utilities';

import './deviceModels.css';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

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

  // changeDeviceGroup = () => {
  //   const { changeDeviceGroup, deviceGroups } = this.props;
  //   changeDeviceGroup(deviceGroups[1].id);
  // }

  closeFlyout = () => this.setState(closedFlyoutState);

  openNewDeviceModelFlyout = () => this.setState({ flyoutOpen: 'new-device-model' });

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
    const { t, deviceModels } = this.props;
    console.log('deviceModels',deviceModels)
    const gridProps = {
      rowData: deviceModels || [],
      onSoftSelectChange: this.onSoftSelectChange,
      onContextMenuChange: this.onContextMenuChange,
      softSelectId: this.state.selectedDeviceId,
      getSoftSelectId: this.getSoftSelectId,
      t
    };
    const newDeviceModelFlyoutOpen = this.state.flyoutOpen === 'new-device-model';

    return [
      <ContextMenu key="context-menu">
        { this.state.contextBtns }
        <Btn svg={svgs.plus} onClick={this.openNewDeviceModelFlyout}>Device models</Btn> { /* TODO: Translate */ }
      </ContextMenu>,
      <PageContent className="devicemodels-container" key="page-content">

        <DeviceModelsGrid {...gridProps} />
        <Btn onClick={this.changeDeviceGroup}>Refresh Device Groups</Btn>
        { /*this.state.flyoutOpen && <DeviceDetailsContainer onClose={this.closeFlyout} device={entities[this.state.selectedDeviceId]} /> */}
        { newDeviceModelFlyoutOpen && <NewDeviceModel onClose={this.closeFlyout}  t={t}/>}
      </PageContent>
    ];
  }
}
