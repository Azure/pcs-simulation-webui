// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Svg } from 'components/shared';

import { svgs } from 'utilities';

import './navigation.css';

/** The navigation tab configurations */
const navLinks = [
  { key: 0, to: '/simulation', svg: svgs.simulationLogo, label: 'Simulation' }
];

/** 
 * A presentational component for nav item svgs 
 * 
 * @param {ReactSVGProps} props see https://www.npmjs.com/package/react-svg
 */
const NavIcon = (props) => (
  <Svg {...props} className="nav-item-icon" />
);

/** A presentational component navigation tab links */
const TabLink = (props) => (
  <NavLink to={props.to} className="nav-item" activeClassName="active">
    <NavIcon path={props.svg} />
    <div className="nav-item-text">{props.label}</div>
  </NavLink>
);

/** The navigation component for the left navigation */
class Navigation extends Component {

  toggleExpanded = (event) => {
    this.setState({ collapsed: !(this.state || {}).collapsed });
  }

  render() {
    const isExpanded = !(this.state || {}).collapsed;
    return (
      <nav className={`app-nav ${isExpanded && 'expanded'}`}>
        <button className="nav-item hamburger" onClick={this.toggleExpanded}>
          <NavIcon path={svgs.hamburger} />
        </button>
        { navLinks.map(navProps => <TabLink {...navProps} />) }
      </nav>
    );
  }
}

export default Navigation;
