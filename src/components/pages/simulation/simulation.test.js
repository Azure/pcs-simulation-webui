// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Simulation } from './simulation';
import { mount } from 'enzyme';
import "mocha-steps";

import 'polyfills';

describe('Simulation Component', () => {
  let wrapper;
  step('Renders without crashing', () => {
    wrapper = mount(<Simulation />);
  });
});
