// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import ProfileImagePath from 'assets/images/profile.png';

import './header.css';

/** The header component for the top of the page */
const Header = (props) => {
  return (
    <header className="app-header">
      <div className="breadcrumbs">{props.breadcrumbs || ''}</div>
      <div className="label">Microsoft Azure IoT Device Simulation</div>
      <div className="items-container">
        <button className="item-icon profile" onClick={() => console.log('Profile coming soon!')}>
          <img src={ProfileImagePath} alt="Generic profile" />
        </button>
      </div>
    </header>
  );
};

export default Header;
