// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

// This component has no style sheet.
// The styles are applied contextually by its parent.

export const SectionDesc = (props) => (
  <div className={joinClasses('section-desc', props.className)}>{props.children}</div>
);
