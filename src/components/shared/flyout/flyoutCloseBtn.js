// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Btn } from '..';
import { svgs } from 'utilities';

export const FlyoutCloseBtn = (props) => (
  <Btn {...props} svg={svgs.x} className="flyout-close-btn" />
);
