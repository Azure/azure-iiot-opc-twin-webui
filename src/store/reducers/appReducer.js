// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import update from 'immutability-helper';
import { OpcTwinService } from 'services';
import { schema, normalize } from 'normalizr';
import { isDef } from 'utilities';

import {
  createReducerScenario,
  createEpicScenario
} from '../utilities';

// ========================= Pending State Flag Generators - START
export const pendingApplications = () => 'FETCHING_APPLICATIONS';
export const pendingEndpoints = (appId) => `FETCHING_ENDPOINTS_${appId}`;
export const pendingNode = (endpointId, nodeId = 'ROOT') => `FETCHING_NODE_${endpointId}_${nodeId}`;
export const pendingRead = () => `FETCHING_READ_DATA`;
export const pendingTwins = () => 'FETCHING_TWINS';
// ========================= Pending State Flag Generators - START

export const toActionCreatorWithPending = (actionCreator, fromAction, pendingFlag) =>
  payload => actionCreator(payload, { fromAction, pendingFlag });

export const toActionCreator = (actionCreator, fromAction ) =>
  payload => actionCreator(payload, { fromAction });

const handleError = (errorFlag, fromAction) => error =>
  Observable.of(redux.actions.registerError(errorFlag, { error, fromAction }));

// ========================= Epics - START
export const epics = createEpicScenario({
  fetchApplications: {
    type: 'FETCH_APPLICATIONS',
    epic: fromAction => {
      const pendingFlag = pendingApplications();
      return OpcTwinService.getApplicationsList()
        .map(toActionCreatorWithPending(redux.actions.updateApplication, fromAction, pendingFlag))
        .startWith(redux.actions.startPendingState(pendingFlag))
        .catch(handleError(pendingFlag, fromAction));
    }
  },
  fetchEndpoints: {
    type: 'FETCH_ENDPOINTS',
    epic: fromAction => {
      const pendingFlag = pendingEndpoints(fromAction.payload);
      return OpcTwinService.getApplication(fromAction.payload) // payload = app id
        .map(({ application, endpoints }) => ({
          ...application,
          endpoints
        }))
        .map(toActionCreatorWithPending(redux.actions.updateApplicationWithEndpoint, fromAction, pendingFlag))
        .startWith(redux.actions.startPendingState(pendingFlag))
        .catch(handleError(pendingFlag, fromAction));
      }
  },
  fetchNode: {
    type: 'FETCH_NODE',
    epic: fromAction => {
      const { endpointId, nodeId } = fromAction.payload;
      const pendingFlag = pendingNode(endpointId, nodeId);
      return OpcTwinService.browseNode(endpointId, nodeId)
        .map(toActionCreatorWithPending(redux.actions.updateRootNode, fromAction, pendingFlag))
        .startWith(redux.actions.startPendingState(pendingFlag))
        .catch(handleError(pendingFlag, fromAction));
    }
  },
  fetchTwins: {
    type: 'FETCH_TWINS',
    epic: fromAction => {
      const pendingFlag = pendingTwins();
      return OpcTwinService.getTwins()
        .map(toActionCreatorWithPending(redux.actions.updateTwins, fromAction, pendingFlag))
        .startWith(redux.actions.startPendingState(pendingFlag))
        .catch(handleError(pendingFlag, fromAction));
    }
  },
  fetchPath: {
    type: 'FETCH_PATH',
    rawEpic: (action$, store, actionType) =>
      action$
        .ofType(actionType)
        .map(({ payload }) => redux.actions.updatePath({payload})) // payload === pathname
  }
});

// ========================= Epics - END

// ========================= Schemas - START
const endpointEntity = new schema.Entity('endpoints');
const endpointListSchema = new schema.Array(endpointEntity);
const applicationEntity = new schema.Entity('applications', { endpoints: endpointListSchema }, { idAttribute: 'applicationId'});
const applicationListSchema = new schema.Array(applicationEntity);

const nodeEntity = new schema.Entity('nodes');
const referenceEntity = new schema.Entity('references', { target: nodeEntity });

const referenceListSchema = new schema.Array(referenceEntity);
const browseNodeResponse = new schema.Object({
  node: nodeEntity,
  references: referenceListSchema
});
// ========================= Schemas - END

// ========================= Reducers - START
const initialState = {
  entities: {
    applications: {},
    endpoints: {},
    nodes: {},
    references: {},
    twins: {},
    path: ''
  },
  pendingStates: {},
  errors: {},
  browseFlyoutIsOpen: false,
  value: {}
};

const unsetPendingFlag = flag => ({ pendingStates: { $unset: [flag] }});

const startPendingStateReducer = (state, action) => update(state, {
  pendingStates: {
    [action.payload]: { $set: true }
  },
  errors: {
    $unset: [action.payload]
  }
});

const registerErrorReducer = (state, { payload, error, fromAction }) => update(state, {
  pendingStates: {
    [payload]: { $set: false }
  },
  errors: {
    [payload]: { $set: error }
  }
});

const updateApplicationsReducer = (state, action) => {
  const { entities: { applications = {} } } = normalize(action.payload, applicationListSchema);
  return update(state, {
    entities: {
      applications: { $set: applications }
    },
    ...unsetPendingFlag(action.pendingFlag)
  });
}

const updateApplicationWithEndpointReducer = (state, action) => {
  const { entities: { applications, endpoints = {} } } = normalize(action.payload, applicationEntity);
  const emptyEndpointKeyMap = Object.keys(endpoints)
    .reduce(
      (acc ,endpointId) => ({ ...acc, [endpointId]: {}}),
      {}
    );
  return update(state, {
    entities: {
      applications: { $merge: applications },
      endpoints: { $merge: endpoints },
      nodes: { $merge: emptyEndpointKeyMap },
      references: { $merge: emptyEndpointKeyMap }
    },
    ...unsetPendingFlag(action.pendingFlag)
  });
}

const updateRootNodeReducer = (state, action) => {
  action.payload.references.forEach ((_, i) => {
    action.payload.references[i].id = i;
  });

  const { entities: { nodes = {}, references }, result } = normalize(action.payload, browseNodeResponse);
  const sourceId = result.node;
  return update(state, {
    entities: {
      nodes: {
        [action.fromAction.payload.endpointId]: { $merge: nodes }
      },
      references: {
        [action.fromAction.payload.endpointId]: {
          [sourceId]: { $set: result.references.map(refId => references[refId].target) },
          // Set the root node if the call doesn't include the nodeId
          ...(
            !isDef(action.fromAction.payload.nodeId)
              ? { ROOT: { $set: sourceId } }
              : {}
          )
        }
      }
    },
    ...unsetPendingFlag(action.pendingFlag)
  });
}

const updateTwinsReducer = (state, action) => { 
  const flatTwin = action.payload.items.map((item) => {return {id: item.applicationId, endpointId: item.registration.id, activated: item.activated}});
 
  return update(state, {
    entities: {
      twins: { $set: flatTwin },
    },
    ...unsetPendingFlag(action.pendingFlag)
  });
}

const updatePathReducer = (state, action) => { 
  
   return update(state, {
    entities: {
      path: { $set: action.payload.payload }
    }
  }); 
}

export const redux = createReducerScenario({
  updateApplication: { type: 'UPDATE_APPLICATIONS', reducer: updateApplicationsReducer },
  updateApplicationWithEndpoint: { type: 'UPDATE_APPLICATION_WITH_ENDPOINT', reducer: updateApplicationWithEndpointReducer },
  updateRootNode: { type: 'UPDATE_ROOT_NODE', reducer: updateRootNodeReducer },
  startPendingState: { type: 'START_PENDING_STATE', reducer: startPendingStateReducer },
  registerError: { type: 'REGISTER_ERROR', reducer: registerErrorReducer },
  updateTwins: { type: 'UPDATE_TWINS', reducer: updateTwinsReducer },
  updatePath: { type: 'UPDATE_PATH', reducer: updatePathReducer }
});

export const reducer = { app: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
export const getAppReducer = state => state.app;
export const getEntities = state => getAppReducer(state).entities;
export const getApplications = state => Object.values(getEntities(state).applications)
export const getEndpoints = state => getEntities(state).endpoints;
export const getNodes = state => getEntities(state).nodes;
export const getReferences = state => getEntities(state).references;
export const getPendingStates = state => getAppReducer(state).pendingStates;
export const getErrors = state => getAppReducer(state).errors;
export const getTwins = state => Object.values(getEntities(state).twins);
export const getPaths = state => getEntities(state).path;
// ========================= Selectors - END
