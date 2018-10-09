// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Start } from './start';
import { mount } from 'enzyme';
import { I18n } from 'react-i18next';

import "mocha-steps";

import 'polyfills';

describe('Start Component', () => {
  it('Renders without crashing', () => {
    const mockProps = {
      counter: 0,
      resetTimer: jest.fn(),
      t: jest.fn()
    };
    const wrapper = mount(<Start {...mockProps} />);
  });
});
