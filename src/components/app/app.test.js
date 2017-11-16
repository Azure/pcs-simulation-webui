// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import App from './app';
import 'polyfills';

it('App renders without crashing', () => {
  const div = document.createElement('div');
  const fakeProps = {
    history: { listen: _ => _ },
    dispatch: _ => _
  };
  ReactDOM.render(
    (
      <MemoryRouter>
        <App {...fakeProps} />
      </MemoryRouter>
    ),
    div
  );
});
