// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import configureStore from 'configureStore';
import AppContainer from 'components/app/app.container';
import "mocha-steps";

import 'polyfills';

describe('App integration test', () => {
  let store, wrapper;

  step('Create redux store', () => {
    store = configureStore();
  });

  it('Render App component', () => {
    wrapper = mount(
      <Provider store={store}>
        <Router>
          <AppContainer />
        </Router>
      </Provider>
    );
  });

  it('Rerouting to simulation worked', () => {
    expect(wrapper.find('.simulation-container').exists()).toBe(true);
  });

});
