// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { ErrorMsg, Indicator } from '../shared';
import { isDef } from 'utilities';

import { pendingApplications, pendingEndpoints, pendingNode, pendingRead } from 'store/reducers/appReducer';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/modules";
import { ManageBrowseMethodsContainer } from './flyouts/manageBrowseMethods';

import './start.css';
import './react-contextmenu.css';
import PageContent from '../app/pageContent';
import { OpcTwinService } from 'services';


const Json = ({ children }) => <pre>{JSON.stringify(children, null, 2) }</pre>;

// TODO: Move to seperate file
// TODO: Create a node rendering presentational component


class NodeApi {
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
  getValue = () => this.componentRef.props.values;


  isError = (flagName) => this.componentRef.props.errors[flagName];
  isPending = (flagName) => this.componentRef.props.pendingStates[flagName];

  isNodeError = (endpointId, nodeId) => this.isError(pendingNode(endpointId, nodeId));
  isEndpointsError = (applicationId) => this.isError(pendingEndpoints(applicationId));
  isApplicationsError = () => this.isError(pendingApplications());

  isNodePending = (endpointId, nodeId) => this.isPending(pendingNode(endpointId, nodeId));
  isEndpointsPending = (applicationId) => this.isPending(pendingEndpoints(applicationId));
  isApplicationsPending = () => this.isPending(pendingApplications());
  isReadPending = (endpointId, nodeId) => this.isPending(pendingRead(endpointId, nodeId));

  // Action creator wrappers
  fetchEndpoints = (applicationId) => this.componentRef.props.fetchEndpoints(applicationId);
  fetchNode = (endpointId, nodeId) => this.componentRef.props.fetchNode(endpointId, nodeId);
  fetchValue = (endpointId, nodeId) => this.componentRef.props.fetchValue(endpointId, nodeId);
  resetValue = () => this.componentRef.props.resetValue();
}

const Expander = ({ expanded }) => <span>[{ expanded ? '-' : '+'}]</span>
const closedFlyoutState = { openFlyoutName: undefined };

class DataNode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      ...closedFlyoutState
    };
  }

  closeFlyout = () => {
    const { api } = this.props;

    this.setState(closedFlyoutState);
  
  }
  openBrowseFlyout = () => this.setState({ openFlyoutName: 'Browse' });

  toggle = () => {
    const { data, api, endpoint } = this.props;

    if (data.children){
      // TODO: Prevent calling again if pending state is active
      if (!isDef(api.getReferences(endpoint, data.id))) api.fetchNode(endpoint, data.id);
      this.setState({ expanded: !this.state.expanded });
    }
    else {
      console.log("name:",data.displayName);
      this.openBrowseFlyout();
    }
  }

  handleClick = (e, data) => {
    console.log("name:",data.item);
  }

  render() {
    const { data, api, endpoint } = this.props;
    const targets = (api.getReferences(endpoint, data.id) || [])
      .map(targetId => api.getNode(endpoint, targetId));
      const error = api.isNodeError(endpoint, data.id);
      const aa = api.getValue(endpoint, data.id);

    const browseFlyoutOpen = this.state.openFlyoutName === 'Browse';

    return (
      <div className="hierarchy-level">
        <div className="hierarchy-name" onClick={this.toggle}>
          { data.displayName }
          { data.children ? <Expander expanded={this.state.expanded} /> : null }
          { api.isNodePending(endpoint, data.id) ? <Indicator /> : null }
        </div>
        <div className="node-details">
          { data.description }
        </div>
        {
          error ? <ErrorMsg>{ error.errorMessage }</ErrorMsg> : null
        }
        {
          this.state.expanded
             && <DataNodeList data={targets} api={api} endpoint={endpoint} />
        }    
        { browseFlyoutOpen && <ManageBrowseMethodsContainer onClose={this.closeFlyout} endpoint={endpoint} data={data} api={api} values={api.getValue()}/> }     
      </div>
    );
  }
}

const DataNodeList = ({ data, api, endpoint }) => data.map(node => (
  <DataNode data={node} api={api} endpoint={endpoint} key={node.id} />
));

class EndpointNode extends Component {

  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  toggle = () => {
    const { data, api } = this.props;
    // TODO: Prevent calling again if pending state is active
    if (!isDef(api.getReferences(data.id))) api.fetchNode(data.id);
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { data, api } = this.props;
    const [_, policy] = data.endpoint.securityPolicy.split('#');
    const rootNode = api.getNode(data.id, api.getReferences(data.id));
    const error = api.isNodeError(data.id);
    return (
      <div className="hierarchy-level">
        <div className="hierarchy-name" onClick={this.toggle}>
          {data.endpoint.url} <Expander expanded={this.state.expanded} />
          { api.isNodePending(data.id) ? <Indicator /> : null }
        </div>
        <div className="node-details">
          {data.endpoint.securityMode}
        </div>
        <div className="node-details">
          {policy}
        </div>
        {
          error ? <ErrorMsg>{ error.errorMessage }</ErrorMsg> : null
        }
        {
          this.state.expanded
            && rootNode
            && <DataNode data={rootNode} api={api} endpoint={data.id} />
        }
      </div>
    );
  }
}

const EndpointNodeList = ({ data, api }) => data.map(endpointId =>
  <EndpointNode data={api.getEndpoint(endpointId)} api={api} key={endpointId} />
);

class ApplicationNode extends Component {

  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  toggle = () => {
    //console.log("props", this.props);
    const { data, api } = this.props;
    // TODO: Prevent calling again if pending state is active
    if (!isDef(data.endpoints)) api.fetchEndpoints(data.applicationId);
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { data, api } = this.props;
    const error = api.isEndpointsError(data.applicationId);
    return (
      <div className="hierarchy-level">
        <div className="hierarchy-name" onClick={this.toggle}>
          {data.applicationUri} <Expander expanded={this.state.expanded} />
          { api.isEndpointsPending(data.applicationId) ? <Indicator /> : null }
        </div>
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        {
          this.state.expanded && data.endpoints && data.endpoints.length
            ? <EndpointNodeList data={data.endpoints} api={api} />
            : null
        }
      </div>
    );
  }
}

const ApplicationNodeList = ({ data, api }) => data.map((app, idx) => (
  <ApplicationNode
    data={app}
    api={api}
    key={app.applicationId} />
));

export class Start extends Component {
  constructor(props) {
    super(props);

    this.nodeApi = new NodeApi(this);
  }

  componentDidMount () {
    this.props.fetchApplications();
    console.log("props", this.props);
  }

  render() {
    const { applications, errors } = this.props;

    return (
      <div className="start-container">
        { this.nodeApi.isApplicationsPending() && <Indicator /> }
        <ApplicationNodeList data={applications} api={this.nodeApi} />
        <h3>Errors</h3>
        <Json>{ errors }</Json>
      </div>
    );
  }
}
