// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import { routeEvent } from 'actions';

import './app.css';

/** The primary app component */
class App extends Component {

  componentDidMount() {
    const { history, dispatch } = this.props;
    // Inject the route change event into the epic action stream
    history.listen(({ pathname }) => dispatch(routeEvent(pathname)));
  }

  render() {
    const time = this.props.timer || 0;
    const min = Math.floor(time / 60);
    const remainder = time % 60;
    const seconds = `${remainder}`.padStart(2, '0');
    return (
      <div className="app">
        PCS Simulation App - Time since last navigation: {`${min}:${seconds}`}
        <br />
        <Link to="/info">Navigate</Link>
        <br />
        <Route path="/info" render={() => (
          <Link to="/">Back</Link>
        )} />
      </div>
    );
  }
}

export default App;
