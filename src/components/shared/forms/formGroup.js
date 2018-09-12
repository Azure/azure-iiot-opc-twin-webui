// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { joinClasses } from 'utilities';

import './formGroup.css';

let idCounter = 0;

export class FormGroup extends Component {

  constructor(props) {
    super(props);
    this.formGroupId = `formGroupId${idCounter++}`;
  }

  render() {
    // Attach the formGroupId to allow automatic focus when a label is clicked
    const childrenWithProps = React.Children.map(this.props.children,
      child => React.cloneElement(child, { formGroupId: this.formGroupId })
    );
    return <div className={joinClasses('form-group', this.props.className)}>{childrenWithProps}</div>;
  }
}

FormGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
