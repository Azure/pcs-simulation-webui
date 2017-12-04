// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Sensor } from './sensor';
import { Btn, FormReplicator } from 'components/shared';
import { svgs } from 'utilities';

import './styles/sensors.css';

const headers = ['SENSOR NAME', 'BEHAVIOR', 'MIN VALUE', 'MAX VALUE', 'UNIT'];

export function Sensors({ sensors, addSensor, updateSensors, ...rest }) {
  return (
    <div className="sensors-container">
      { sensors.length > 0 &&
        <div className="sensor-headers">
          {
            headers.map((header, idx) => (
              <div className="sensor-header" key={idx}>{header}</div>
            ))
          }
        </div>
      }
      <FormReplicator value={sensors} onChange={updateSensors}>
        {(sensor, index) => <Sensor {...rest} key={index} sensor={sensor} replicable/>}
      </FormReplicator>
      <Btn svg={svgs.plus} type="button" onClick={addSensor}>
        Add sensor
      </Btn>
    </div>
  );
}
