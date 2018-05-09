// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import Flyout from 'components/shared/flyout';
import DeviceModelForm from '../views/deviceModelForm';

import './editDeviceModel.css';

export const EditDeviceModel = (props) => (
  <Flyout.Container className="new-rule-flyout-container">
    <Flyout.Header>
      <Flyout.Title>{props.t('deviceModels.flyouts.edit.title')}</Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <DeviceModelForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
