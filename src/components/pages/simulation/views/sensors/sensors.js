// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Sensor } from './sensor';
import { Btn, FormReplicator } from 'components/shared';
import { svgs } from 'utilities';

import './styles/sensors.css';

const headers = ['SENSOR NAME', 'BEHAVIOR', 'MIN VALUE', 'MAX VALUE', 'UNIT'];

const  SensorHeader = <div className="sensor-headers">
  { headers.map((header, idx) => (
    <div className="sensor-header" key={idx}>{header}</div>
  )) }
</div>;

export function SensorsDetails({ sensors }) {
  return (
    <div className="sensors-container">
      { sensors.length > 0 && SensorHeader }
      <FormReplicator value={sensors}>
        {(sensor, index) => <div className="sensor-container">
          <div className="sensor-box" key="name">{sensor.name}</div>
          <div className="sensor-box" key="behavior">{sensor.path}</div>
          <div className="sensor-box" key="min">{sensor.min}</div>
          <div className="sensor-box" key="max">{sensor.max}</div>
          <div className="sensor-box" key="unit">{sensor.unit}</div>
        </div>}
      </FormReplicator>
    </div>
  );
}

export function Sensors({ sensors, addSensor, updateSensors, ...rest }) {
  return (
    <div className="sensors-container">
      { sensors.length > 0 && SensorHeader }
      <FormReplicator value={sensors} onChange={updateSensors}>
        {(sensor, index) => <Sensor {...rest} key={index} sensor={sensor} replicable/>}
      </FormReplicator>
      <Btn svg={svgs.plus} type="button" onClick={addSensor}>
        Add sensor
      </Btn>
    </div>
  );
}
