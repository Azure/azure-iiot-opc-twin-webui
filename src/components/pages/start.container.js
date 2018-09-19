// Copyright (c) Microsoft. All rights reserved.

import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { Start } from './start';
import {
  epics,
  getApplications,
  getEndpoints,
  getEntities,
  getNodes,
  getPendingStates,
  getReferences,
  getErrors,
  getBrowseFlyoutStatus,
  getValues
} from 'store/reducers/appReducer';

const mapStateToProps = state => ({
  applications: getApplications(state),
  endpoints: getEndpoints(state),
  entities: getEntities(state),
  nodes: getNodes(state),
  pendingStates: getPendingStates(state),
  references: getReferences(state),
  errors: getErrors(state),
  browseFlyoutIsOpen: getBrowseFlyoutStatus(state),
  values: getValues(state)
});

const mapDispatchToProps = dispatch => {
  window.savedDispatch = dispatch;
  window.savedEpics = epics;
  return {
    fetchApplications: () => dispatch(epics.actions.fetchApplications()),
    fetchEndpoints: (applicationId) => dispatch(epics.actions.fetchEndpoints(applicationId)),
    fetchNode: (endpointId, nodeId) => dispatch(epics.actions.fetchNode({ endpointId, nodeId })),
    fetchValue: (endpointId, nodeId) => dispatch(epics.actions.fetchValue({ endpointId, nodeId })),
    resetValue: () => dispatch(epics.actions.resetValue())
  };
}

export const StartContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(Start));
