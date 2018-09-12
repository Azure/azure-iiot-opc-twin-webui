// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import PropTypes from 'prop-types';

import { joinClasses } from 'utilities';

import './btnToolbar.css';

export const BtnToolbar = (props) => (
  <div className={joinClasses('btn-toolbar', props.className)}>{props.children}</div>
);

BtnToolbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
