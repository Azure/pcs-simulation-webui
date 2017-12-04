// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { FormGroup, FormControl } from 'components/shared';

const options = [
  { value: 'Math.Increasing', label: 'Increment' },
  { value: 'Math.Random.WithinRange', label: 'Random' },
  { value: 'Math.Decreasing', label: 'Decrement' }
]

export function Sensor({ sensor, onChange, value }) {
  const { name, behavior, minValue, maxValue, unit } = sensor;
  const onBehaviorChange = (value) => onChange({target: { name: 'behavior', value }});

  return (
    <div className="sensor-container">
      <div className="sensor-box">
        <FormGroup>
          <FormControl
          type="text"
          className="short"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Enter sensor name" />
        </FormGroup>
      </div>
      <div className="sensor-box">
        <FormGroup>
          <FormControl
            className="short"
            name="behavior"
            type="select"
            options={options}
            value={behavior}
            onChange={onBehaviorChange}
            clearable={false}
            searchable={true}
            placeholder="Select behavior" />
        </FormGroup>
      </div>
      <div className="sensor-box">
        <FormGroup>
          <FormControl
            type="number"
            className="short"
            value={minValue}
            name="minValue"
            onChange={onChange}
            placeholder="Enter min value" />
        </FormGroup>
      </div>
      <div className="sensor-box">
        <FormGroup>
          <FormControl
            type="number"
            className="short"
            name="maxValue"
            value={maxValue}
            onChange={onChange}
            placeholder="Enter max value" />
        </FormGroup>
      </div>
      <div className="sensor-box">
        <FormGroup>
          <FormControl
            type="text"
            className="short"
            value={unit}
            name="unit"
            onChange={onChange}
            placeholder="Enter unit value" />
        </FormGroup>
      </div>
    </div>
  );
}
