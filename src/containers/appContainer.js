// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import App from 'components/app/app';

// Connect the App component with the router
const AppWithRouter = withRouter(App);

// Connect the App component to the redux store
const mapStateToProps = ({ timer }) => ({ timer: timer.seconds });
const AppContainer = connect(mapStateToProps)(AppWithRouter);

export default AppContainer;
