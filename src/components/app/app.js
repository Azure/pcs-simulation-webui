// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import { routeEvent } from 'actions';

// App Components
import Header from './header/header';
import Navigation from './navigation/navigation';
import Main from './main/main';
import PageContainer from './pageContainer/pageContainer';

// Page Components
import  { 
  Simulation,
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
          <PageContainer>
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/simulation" push={true} />} />
              <Route exact path="/simulation" component={Simulation} />
              <Route component={PageNotFound} />
            </Switch>
          </PageContainer>
        </Main>
      </div>
    );
  }
  
}

export default App;
