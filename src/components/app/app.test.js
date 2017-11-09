// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const fakeProps = {
    history: { listen: _ => _ },
    dispatch: _ => _,
    timer: 0
  };
  ReactDOM.render(
    (
      <BrowserRouter>
        <App {...fakeProps} />
      </BrowserRouter>
    ),
    div
  );
});
