// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactSVG from 'react-svg';

import './svg.css';

/** Wraps an svg in a bounding box container for easier styling */
export const Svg = ({ className, ...props } = {}) => (
  <div className={`svg-container ${className || ''}`}>
    <ReactSVG {...props} className={props.svgClassName} />
  </div>
);
