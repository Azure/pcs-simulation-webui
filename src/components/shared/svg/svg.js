// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactSVG from 'react-svg';

import './svg.css';

/** Wraps an svg in a bounding box container for easier styling */
export const Svg = (props = {}) => (
  <div className={`svg-container ${props.className || ''}`}>
    <ReactSVG {...props} className={props.svgClassName} />
  </div>
);

export default Svg;
