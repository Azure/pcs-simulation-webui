// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactSVG from 'react-svg';
import svgs from 'utilities/svgs';

import ProfileImagePath from '../../../assets/images/profile.png';

import './header.css';

/** The hader component for the top of the page */
const Header = () => {
  return (
    <div className="app-header">
      <div className="breadcrumbs"></div>
      <div className="label">Azure Device Simulation</div>
      <div className="items-container">
        <div className="item-icon">
          <ReactSVG path={svgs.settings} />
        </div>
        <div className="item-icon">
          <img src={ProfileImagePath} alt="Generic profile" />
        </div>
      </div>
    </div>
  );
};

export default Header;
