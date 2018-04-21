// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import Flyout from 'components/shared/flyout';
import DeviceModelForm from '../views/deviceModelForm';

import './newDeviceModel.css';

export const NewDeviceModel = (props) => (
  <Flyout.Container className="new-rule-flyout-container">
    <Flyout.Header>
      <Flyout.Title>{props.t('deviceModels.flyouts.new.title')}</Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <DeviceModelForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
