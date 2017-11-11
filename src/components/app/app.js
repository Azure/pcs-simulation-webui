// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import { routeEvent } from 'actions';
import Header from './header/header';
import Navigation from './navigation/navigation';

import './app.css';

/** The primary app component */
class App extends Component {

  componentDidMount() {
    const { history, dispatch } = this.props;
    // Initialize listener to inject the route change event into the epic action stream
    history.listen(({ pathname }) => dispatch(routeEvent(pathname)));
  }

  render() {
    return (
      <div className="app">
        <Navigation />
        <div className="app-view-container">
          <Header />
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/simulation" push={true} />} />
            <Route path="/simulation" render={() => <span>Simulation coming soon!</span>} />
            <Route render={() => <span>404 Page Not Found</span>} />
          </Switch>
        </div>
      </div>
    );
  }
  
}

export default App;
