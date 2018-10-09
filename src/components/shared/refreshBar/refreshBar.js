// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import moment from 'moment';
import { Btn } from 'components/shared';
import { svgs } from 'utilities';
import { DEFAULT_TIME_FORMAT } from 'components/shared/pcsGrid/pcsGridConfig';

import './refreshBar.css';

export class RefreshBar extends Component {

  refresh = () => !this.props.isPending && this.props.refresh();

  render () {
    const { t, isPending, time} = this.props;
    return (
      <div className="last-updated-container">
        {
          isPending || time
            ? <span className="time">
                <span className="refresh-text">{ isPending ? t('refreshBar.refreshing') : t('refreshBar.lastRefreshed')} | </span>
                { !isPending ? moment(time).format(DEFAULT_TIME_FORMAT) : '' }
              </span>
            : null
        }
        <Btn svg={svgs.refresh} className={`refresh-btn ${isPending ? 'refreshing' : ''}`} onClick={this.refresh} />
      </div>
    );
  }
}
