// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { routeEvent } from 'actions';
import { AuthService } from 'services';
import App from './app';

// Wrap with the router and wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  registerRouteEvent: pathname => dispatch(routeEvent(pathname)),
  logout: () => AuthService.logout()
});

const AppContainer = withRouter(connect(undefined, mapDispatchToProps)(App));

export default AppContainer;
