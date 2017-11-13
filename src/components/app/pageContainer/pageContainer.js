// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import './pageContainer.css';

/** A presentational component containing the content for a page */
const PageContainer = (props) => (
  <div className={`page-container ${props.className || ''}`}>
    {props.children}
  </div>
);

export default PageContainer;
