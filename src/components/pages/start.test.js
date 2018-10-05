// Copyright (c) Microsoft. All rights reserved.

import React from '../../../../../../../../Users/dacol/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/react';
import { Start } from './start';
import { mount } from '../../../../../../../../Users/dacol/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/enzyme';
import { I18n } from '../../../../../../../../Users/dacol/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/react-i18next';

import "../../../../../../../../Users/dacol/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/mocha-steps";

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
