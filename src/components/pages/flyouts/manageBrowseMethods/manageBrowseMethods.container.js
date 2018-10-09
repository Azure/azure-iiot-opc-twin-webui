// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { redux as appRedux } from 'store/reducers/appReducer';

import { ManageBrowseMethods } from './manageBrowseMethods';

const mapDispatchToProps = dispatch => ({
  openFlyout: () => dispatch(appRedux.actions.setBrowseFlyoutStatus(true)),
  closeFlyout: () => dispatch(appRedux.actions.setBrowseFlyoutStatus(false)),
}); 

export const ManageBrowseMethodsContainer = translate()(connect(null, mapDispatchToProps)(ManageBrowseMethods));
