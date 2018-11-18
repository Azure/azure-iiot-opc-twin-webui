// Copyright (c) Microsoft. All rights reserved.

import { 
    pendingApplications,
    pendingSupervisors, 
    pendingEndpoints, 
    pendingNode, 
    pendingRead
  } from 'store/reducers/appReducer';

export class NodeApi {
    constructor(componentRef) {
      this.componentRef = componentRef;
    }
  
    // Selectors
    getEndpoint = (id) => this.componentRef.props.endpoints[id];
    getNode = (endpointId, nodeId) =>
      endpointId && nodeId
        ? this.componentRef.props.nodes[endpointId][nodeId]
        : undefined;
    getReferences = (endpointId, nodeId = 'ROOT') => this.componentRef.props.references[endpointId][nodeId];
  
    isError = (flagName) => this.componentRef.props.errors[flagName];
    isPending = (flagName) => this.componentRef.props.pendingStates[flagName];
  
    isNodeError = (endpointId, nodeId) => this.isError(pendingNode(endpointId, nodeId));
    isEndpointsError = (applicationId) => this.isError(pendingEndpoints(applicationId));
    isApplicationsError = () => this.isError(pendingApplications());
  
    isNodePending = (endpointId, nodeId) => this.isPending(pendingNode(endpointId, nodeId));
    isEndpointsPending = (applicationId) => this.isPending(pendingEndpoints(applicationId));
    isApplicationsPending = () => this.isPending(pendingApplications());
    isSupervisorsPending = () => this.isPending(pendingSupervisors());
    isReadPending = () => this.isPending(pendingRead());
  
    // Action creator wrappers
    fetchApplications = (supervisor) => this.componentRef.props.fetchApplications(supervisor);
    fetchEndpoints = (applicationId) => this.componentRef.props.fetchEndpoints(applicationId);
    fetchNode = (endpointId, nodeId) => this.componentRef.props.fetchNode(endpointId, nodeId);
    fetchTwins = () => this.componentRef.props.fetchTwins();
    fetchSupervisors = (onlyServerState) => this.componentRef.props.fetchSupervisors(onlyServerState);
    fetchPath = (path) => this.componentRef.props.fetchPath(path);
  }