// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { 
  redux as appRedux,
  epics,
  getValue
 } from 'store/reducers/appReducer';

import { ManageBrowseMethods } from './manageBrowseMethods';

//const mapStateToProps = state => ({
//  value: getValue(state)
//});

const mapDispatchToProps = dispatch => ({
  openFlyout: () => dispatch(appRedux.actions.setBrowseFlyoutStatus(true)),
  closeFlyout: () => dispatch(appRedux.actions.setBrowseFlyoutStatus(false)),
  //fetchValue: (endpointId, nodeId) => dispatch(epics.actions.fetchValue({ endpointId, nodeId }))
}); 

export const ManageBrowseMethodsContainer = translate()(connect(null, mapDispatchToProps)(ManageBrowseMethods));
