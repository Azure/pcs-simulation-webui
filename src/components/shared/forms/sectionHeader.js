// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

// This component has no style sheet.
// The styles are applied contextually by its parent.

export const SectionHeader = (props) => (
  <div className={joinClasses('section-header', props.className)}>{props.children}</div>
);
