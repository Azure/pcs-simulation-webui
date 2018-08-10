// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs } from 'utilities';
import Flyout from 'components/shared/flyout';
import { Svg } from 'components/shared';
import DeviceModelForm from '../views/deviceModelForm';
import DeviceModelUploadForm from '../views/deviceModelUploadForm';

export class NewDeviceModel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      basic: false
    };
  }

  onClickBasic = () => this.setState({ basic: true });

  onClickAdvanced = () => this.setState({ basic: false });

  render() {
    const { t, onClose } = this.props;
    const { basic } = this.state;

    return (
      <Flyout.Container className="device-model-flyout-container">
        <Flyout.Header>
          <Flyout.Title>
            <Svg path={svgs.plus} className="flyout-title-icon" />
            { t('deviceModels.flyouts.new.title') }
          </Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content >
          <div className='tab-container'>
            <div className={basic ? 'tab active' : 'tab'} onClick={this.onClickBasic}>Basic</div>
            <div className={basic ? 'tab' : 'tab active'} onClick={this.onClickAdvanced}>Advanced</div>
          </div>
          {
            basic
              ? <DeviceModelForm {...this.props} />
              : <DeviceModelUploadForm {...this.props} />
          }
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
