// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import Svgs from 'svgs';

import './navigation.scss';

/** The navigation tab configurations */
const navLinks = [
  { key: 0, to: '/simulations', svg: Svgs.Simulation, labelId: 'tabs.simulation' },
  { key: 1, to: '/devicemodels', svg: Svgs.TabDevices, labelId: 'tabs.deviceModels' }
];

/** A window size less than this will automatically collapse the left nav */
const minExpandedNavWindowWidth = 800;

/** A presentational component navigation tab links */
const TabLink = ({svg: Svg , ...props}) => (
  <NavLink to={props.to} className="nav-item" activeClassName="active">
    <div className="nav-item-icon">
      <Svg />
    </div>
    <div className="nav-item-text">{props.t(props.labelId)}</div>
  </NavLink>
);

const TransTabLink = translate()(TabLink);

/** The navigation component for the left navigation */
class Navigation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      lastWidth: window.innerWidth
    };

    // Collapse the nav if the window width is too small
    window.onresize = () => {
      if (
        window.innerWidth < minExpandedNavWindowWidth
        && window.innerWidth < this.state.lastWidth // When the window is shrinking
        && !this.state.collapsed
      ) {
        this.setState({ collapsed: true, lastWidth: window.innerWidth });
      } else {
        this.setState({ lastWidth: window.innerWidth });
      }
    };
  }

  toggleExpanded = (event) => {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const isExpanded = !this.state.collapsed;
    return (
      <nav className={`app-nav ${isExpanded && 'expanded'}`}>
        <button className="nav-item hamburger" onClick={this.toggleExpanded}>
          <div className="nav-item-icon">
            <Svgs.Hamburger />
          </div>
        </button>
        { navLinks.map(navProps => <TransTabLink {...navProps} />) }
      </nav>
    );
  }
}

export default Navigation;
