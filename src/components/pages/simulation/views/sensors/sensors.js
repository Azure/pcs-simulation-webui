// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Sensor } from './sensor';
import { Btn } from 'components/shared';
import { svgs } from 'utilities';

import './styles/sensors.css';

const headers = ['SENSOR NAME', 'BEHAVIOR', 'MIN VALUE', 'MAX VALUE', 'UNIT'];

export function Sensors({ sensors, addSensor, ...rest }) {
  return (
    <div className="sensors-container">
      { Object.keys(sensors).length > 0 &&
        <div className="sensor-headers">
          {
            headers.map((header, idx) => (
              <div className="sensor-header" key={idx}>{header}</div>
            ))
          }
        </div>
      }
      {
        Object.keys(sensors).map((id, index) => (
          <Sensor {...rest} key={index} sensor={{...sensors[id], sensorId: id}} />
        ))
      }
      <Btn svg={svgs.plus} type="button" onClick={addSensor}>
        Add sensor
      </Btn>
    </div>
  );
}
