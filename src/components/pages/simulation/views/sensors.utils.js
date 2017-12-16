// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { FormGroup, FormControl } from 'components/shared';

const headers = [ 'SENSOR NAME', 'BEHAVIOR', 'MIN VALUE', 'MAX VALUE', 'UNIT' ];

export const  SensorHeader = <div className="sensor-headers">
  { headers.map((header, idx) => (
    <div className="sensor-header" key={idx}>{header}</div>
  )) }
</div>;

export const behaviorOptions = [
  { value: 'Math.Random.WithinRange', label: 'Random' },
  { value: 'Math.Increasing', label: 'Increment' },
  { value: 'Math.Decreasing', label: 'Decrement' }
];

export const toSensorInput = (link, placeholder, error) => (
  <FormGroup className="sensor-box">
    <FormControl
      className="short"
      type="text"
      link={link}
      placeholder={placeholder}
      errorState={error} />
  </FormGroup>
);

export const toSensorSelect = (link, type, placeholder, options, error) => (
  <FormGroup className="sensor-box">
    <FormControl
      className="short"
      type={type}
      link={link}
      options={options}
      clearable={false}
      searchable={true}
      placeholder={placeholder}
      errorState={error} />
  </FormGroup>
);
