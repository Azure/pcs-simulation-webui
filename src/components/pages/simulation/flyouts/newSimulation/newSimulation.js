// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { svgs } from 'utilities';
import Flyout from 'components/shared/flyout';
import { Svg } from 'components/shared';
import SimulationForm from '../../views/simulationForm';

export const NewSimulation = (props) => (
  <Flyout.Container>
    <Flyout.Header>
      <Flyout.Title>
        <Svg path={svgs.plus} className="flyout-title-icon" />
        {props.t('simulation.simSetup')}
      </Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <SimulationForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
