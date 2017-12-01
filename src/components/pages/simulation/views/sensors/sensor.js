// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { FormGroup, FormControl } from 'components/shared';
import './styles/sensors.css';

const options = [
  { value: 'Math.Increasing', label: 'Increment' },
  { value: 'Math.Random.WithinRange', label: 'Random' },
  { value: 'Math.Decreasing', label: 'Decrement' }
]

export function Sensor({ sensor, onChange, onSelectionChange, value }) {
  const { name, behavior, minValue, maxValue, unit, sensorId } = sensor;
  const onBehaviorChange = (option) => onSelectionChange({...option, sensorId})

  return (
    <div className="sensor-container">
      <div className="sensor-box">
        <FormGroup>
          <FormControl
          type="text"
          className="short"
          id={sensorId}
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
            id={sensorId}
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
            id={sensorId}
            value={minValue}
            name="minValue"
            onChange={onChange}
            placeholder="Enter min value" />
        </FormGroup>
      </div>
      <div className="sensor-box">
        <FormGroup>
          <FormControl
            id={sensorId}
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
            id={sensorId}
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
