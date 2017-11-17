// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import { routeEvent } from 'actions';

// App Components
import Header from './header/header';
import Navigation from './navigation/navigation';
import Main from './main/main';
import PageContent from './pageContent/pageContent';

// Page Components
import  {
  Simulation as SimulationPage,
  PageNotFound
} from 'components/pages';

import './app.css';

/** The base component for the app */
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
        <Main>
          <Header />
          <PageContent>
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/simulation" push={true} />} />
              <Route exact path="/simulation" component={SimulationPage} />
              <Route component={PageNotFound} />
            </Switch>
          </PageContent>
        </Main>
      </div>
    );
  }

}

export default App;
