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
  getTwins
} from 'store/reducers/appReducer';

const mapStateToProps = state => ({
  applications: getApplications(state),
  endpoints: getEndpoints(state),
  entities: getEntities(state),
  nodes: getNodes(state),
  pendingStates: getPendingStates(state),
  references: getReferences(state),
  errors: getErrors(state),
  twins: getTwins(state)
});

const mapDispatchToProps = dispatch => {
  window.savedDispatch = dispatch;
  window.savedEpics = epics;
  return {
    fetchApplications: () => dispatch(epics.actions.fetchApplications()),
    fetchEndpoints: (applicationId) => dispatch(epics.actions.fetchEndpoints(applicationId)),
    fetchNode: (endpointId, nodeId) => dispatch(epics.actions.fetchNode({ endpointId, nodeId })),
    fetchTwins: () => dispatch(epics.actions.fetchTwins())
  };
}

export const StartContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(Start));
