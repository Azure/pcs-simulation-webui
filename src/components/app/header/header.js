// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import svgs from 'utilities/svgs';
import { Svg } from 'components/shared';

import ProfileImagePath from '../../../assets/images/profile.png';

import './header.css';

/** The hader component for the top of the page */
const Header = (props) => {
  return (
    <div className="app-header">
      <div className="breadcrumbs">{props.breadcrumbs || ''}</div>
      <div className="label">Azure Device Simulation</div>
      <div className="items-container">
        <Svg path={svgs.settings} className="item-icon" />
        <div className="item-icon profile">
          <img src={ProfileImagePath} alt="Generic profile" />
        </div>
      </div>
    </div>
  );
};

export default Header;
