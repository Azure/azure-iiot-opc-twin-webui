// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Select } from 'components/shared';
import { isFunc } from 'utilities';

import './endpointDropdown.css';

const optionValues = [
  { value: 'all' },
  { value: 'secure' } 
];

export class EndpointDropdown extends Component {
  
  onChange = (propOnChange) => ({ target: { value: { value } = {} } = {} }) => {
    if (isFunc(propOnChange)) propOnChange(value);
  }

  render() {
    const options = optionValues.map(({ value }) => ({
      label: this.props.t(`endpointFilter.${value}`),
      value
    }));
    return (
      <Select
        className="endpoint-dropdown"
        options={options}
        value={this.props.value}
        searchable={false}
        clearable={false}
        onChange={this.onChange(this.props.onChange)} />
    );
  }
}
