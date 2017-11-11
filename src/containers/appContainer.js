// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import App from 'components/app/app';

// Wrap with the router and connect (to access dispatch)
const AppContainer = withRouter(connect()(App));

export default AppContainer;
