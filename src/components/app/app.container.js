// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { routeEvent } from 'actions';
import App from './app';

// Wrap with the router and connect (to access dispatch)
// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  registerRouteEvent: pathname => dispatch(routeEvent(pathname))
});

const AppContainer = withRouter(connect(undefined, mapDispatchToProps)(App));

export default AppContainer;
