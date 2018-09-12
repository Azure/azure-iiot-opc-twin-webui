// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import PropTypes from 'prop-types';

import { joinClasses } from 'utilities';

import './formActions.css';

export const FormActions = (props) => (
  <div className={joinClasses('form-actions-container', props.className)}>{props.children}</div>
);

FormActions.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
