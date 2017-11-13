// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import './pageNotFound.css';

export const PageNotFound = () => {
  const failQuotes = [
    `"I have not failed. I've just found 10,000 ways that won't work." - Thomas A. Edison`,
    `"We are all failures - at least the best of us are." - J.M. Barrie`,
    `"Failures are finger posts on the road to achievement." - C.S. Lewis`,
    `"Success is stumbling from failure to failure with no loss of enthusiasm." - Winston Churchill`,
    `"The fail boat is real and it has arrived" - Some developer at Microsoft`
  ];
  const quoteIndex = Math.floor(Math.random() * 20) % failQuotes.length;
  return (
    <div class="page-not-found-container">
      Um, we looked for the page you requested but only found this quote:<br />
      <br />
      <span className="quote">{failQuotes[quoteIndex]}</span>
    </div>
  );
};
