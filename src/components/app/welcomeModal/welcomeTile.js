// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { Btn } from 'components/shared';
import './welcomeTile.css';

export const WelcomeTile = ({ onClick, imgPath, title, description, btnName }) => (
  <div className="welcome-tile-container">
    <div className="welcome-tile-img-container"><img alt={`${btnName}`} src={imgPath}/></div>
    <div className="welcome-tile-title">{title}</div>
    <div className="welcome-tile-description">{description}</div>
    <div className="btn-container"><Btn onClick={onClick}>{btnName}</Btn></div>
  </div>
);
