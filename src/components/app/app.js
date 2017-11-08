import React, { Component } from 'react';
import { Link, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { routeEvent } from 'actions';

import './app.css';

/** The primary app component */
class App extends Component {

  componentDidMount() {
    const { history, dispatch }  = this.props;
    // Inject the route change event into the action stream
    history.listen(({ pathname }) => dispatch(routeEvent(pathname)));
  }

  render() {
    const time = this.props.timer || 0;
    const min = Math.floor(time / 60);
    const seconds = `${time % 60}`.padStart(2, '0');
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

// Connect the react router to the component to get access to the history
const AppWithRouter = withRouter(App);

// Connect the component to the redux store
const mapStateToProps = ({ timer }) => ({ timer: timer.seconds });
export default connect(mapStateToProps)(AppWithRouter);
