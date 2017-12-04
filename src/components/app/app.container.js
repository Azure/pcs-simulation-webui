// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthService } from 'services';
import { epics as appEpics } from 'store/reducers/appReducer';
import App from './app';

// Wrap with the router and wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  registerRouteEvent: pathname => dispatch(appEpics.detectRouteChange.action(pathname)),
  logout: () => AuthService.logout()
});

const AppContainer = withRouter(connect(undefined, mapDispatchToProps)(App));

export default AppContainer;
