// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import Flyout from 'components/shared/flyout';
import DeviceModelForm from '../views/deviceModelForm';

import './newDeviceModel.css';

export class NewDeviceModel extends Component {

  render() {
    const { onClose, t } = this.props;

    return (
      <Flyout.Container className="new-rule-flyout-container">
        <Flyout.Header>
          <Flyout.Title>{t('deviceModels.flyouts.new.title')}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content >
          <DeviceModelForm {...this.props} />
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
