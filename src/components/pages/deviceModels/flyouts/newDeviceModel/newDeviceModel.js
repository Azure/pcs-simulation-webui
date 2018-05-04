// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { svgs } from 'utilities';
import Flyout from 'components/shared/flyout';
import { Svg } from 'components/shared';
import DeviceModelForm from '../views/deviceModelForm';

export const NewDeviceModel = (props) => (
  <Flyout.Container className="device-model-flyout-container">
    <Flyout.Header>
      <Flyout.Title>
        <Svg path={svgs.plus} className="flyout-title-icon" />
        {props.t('deviceModels.flyouts.new.title')}
      </Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <DeviceModelForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
