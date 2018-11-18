// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { svgs } from 'utilities';
import { Svg } from 'components/shared';

export class Expander extends Component {
    render() {
      return (
        <div className="expander" onClick={this.props.onClick}>
          { this.props.expanded 
            ? <Svg className="tree-view-expander-open" path={svgs.TreeArrowOpen}/> 
            : <Svg className="tree-view-expander" path={svgs.TreeArrowClose}/>
          }
        </div>
      )
    }
  } 