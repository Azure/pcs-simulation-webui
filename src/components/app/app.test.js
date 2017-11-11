// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

// Include the polyfill to allow the test to pass
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

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
