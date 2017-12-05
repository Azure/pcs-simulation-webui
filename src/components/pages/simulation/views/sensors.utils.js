// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { FormGroup, FormControl } from 'components/shared';

const headers = ['SENSOR NAME', 'BEHAVIOR', 'MIN VALUE', 'MAX VALUE', 'UNIT'];

export const  SensorHeader = <div className="sensor-headers">
  { headers.map((header, idx) => (
    <div className="sensor-header" key={idx}>{header}</div>
  )) }
</div>;

export const behaviorOptions = [
  { value: 'Math.Increasing', label: 'Increment' },
  { value: 'Math.Random.WithinRange', label: 'Random' },
  { value: 'Math.Decreasing', label: 'Decrement' }
]

export const toSensorInput = (name, type, placeholder, value, onChange) => <FormGroup className="sensor-box">
  <FormControl
    className="short"
    replicable
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder} />
</FormGroup>;

export const toSensorSelect = (name, type, placeholder, value, onChange, options) => <FormGroup className="sensor-box">
  <FormControl
    className="short"
    replicable
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    options={options}
    clearable={false}
    searchable={true}
    placeholder={placeholder} />
</FormGroup>;
