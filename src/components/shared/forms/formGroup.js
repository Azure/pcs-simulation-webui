// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import './styles/formGroup.css';

let idCounter = 0;

export const FormGroup = (props) => {
  const formGroupId = `formGroupId${idCounter++}`;
  // Attach the formGroupId to allow automatic focus when a label is clicked
  const childrenWithProps = React.Children.map(props.children,
    (child) => React.cloneElement(child, { formGroupId })
  );
  return <div className={joinClasses('form-group', props.className)}>{childrenWithProps}</div>;
};
