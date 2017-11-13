// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import svgs from 'utilities/svgs';
import { Svg } from 'components/shared';

import ProfileImagePath from '../../../assets/images/profile.png';

import './header.css';

/** The hader component for the top of the page */
const Header = (props) => {
  return (
    <header className="app-header">
      <div className="breadcrumbs">{props.breadcrumbs || ''}</div>
      <div className="label">Azure Device Simulation</div>
      <div className="items-container">
        <button onClick={() => console.log('Settings coming soon!')}>
          <Svg path={svgs.settings} className="item-icon" />
        </button>
        <button className="item-icon profile" onClick={() => console.log('Profile coming soon!')}>
          <img src={ProfileImagePath} alt="Generic profile" />
        </button>
      </div>
    </header>
  );
};

export default Header;
