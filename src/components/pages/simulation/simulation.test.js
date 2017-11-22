// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Simulation } from './simulation';
import { mount } from 'enzyme';
import "mocha-steps";

import 'polyfills';

describe('Simulation Component', () => {
  let wrapper;
  const mockProps = {
    simulation: {
      eTag: `"2600c470-0000-0000-0000-5a15e4d60000"`,
      enabled: false,
      startTime: '17-11-22T00:15:58+00:00',
      endTime: '2017-11-29T00:15:58+00:00',
      id: '1',
      deviceModels: [
        { Id: 'chiller-01', Count: 100 }
      ]
    }
  };
  it('Renders without crashing', () => {
    wrapper = mount(<Simulation {...mockProps} />);
  });
});
