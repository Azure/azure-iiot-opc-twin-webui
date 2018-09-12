// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { ErrorMsg, Indicator } from 'components/shared';
import { isDef } from 'utilities';

import { pendingApplications, pendingEndpoints, pendingNode } from 'store/reducers/appReducer';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import './start.css';
import './react-contextmenu.css';

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
  isError = (flagName) => this.componentRef.props.errors[flagName];
  isPending = (flagName) => this.componentRef.props.pendingStates[flagName];

  isNodeError = (endpointId, nodeId) => this.isError(pendingNode(endpointId, nodeId));
  isEndpointsError = (applicationId) => this.isError(pendingEndpoints(applicationId));
  isApplicationsError = () => this.isError(pendingApplications());

  isNodePending = (endpointId, nodeId) => this.isPending(pendingNode(endpointId, nodeId));
  isEndpointsPending = (applicationId) => this.isPending(pendingEndpoints(applicationId));
  isApplicationsPending = () => this.isPending(pendingApplications());

  // Action creator wrappers
  fetchEndpoints = (applicationId) => this.componentRef.props.fetchEndpoints(applicationId);
  fetchNode = (endpointId, nodeId) => this.componentRef.props.fetchNode(endpointId, nodeId);
}

const Expander = ({ expanded }) => <span>[{ expanded ? '-' : '+'}]</span>

class DataNode extends Component {

  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  toggle = () => {
    const { data, api, endpoint } = this.props;
    // TODO: Prevent calling again if pending state is active
    if (!isDef(api.getReferences(endpoint, data.id))) api.fetchNode(endpoint, data.id);
    this.setState({ expanded: !this.state.expanded });
  }

  handleClick = (e, data) => {
    console.log("name:",data.item);
  }

  render() {
    const { data, api, endpoint } = this.props;
    const targets = (api.getReferences(endpoint, data.id) || [])
      .map(targetId => api.getNode(endpoint, targetId));
    const error = api.isNodeError(endpoint, data.id);
    const MENU = "menu" + data.id;
    return (
      <div>
        <ContextMenuTrigger id={MENU}  holdToDisplay={1000}>
          <div className="hierarchy-level">
          <div className="hierarchy-name" onClick={this.toggle}>
            {data.displayName}
            {data.children ? <Expander expanded={this.state.expanded} /> : null}
            { api.isNodePending(endpoint, data.id) ? <Indicator /> : null }
          </div>

          <div className="node-details">
            {data.description}
          </div>
          {
            error ? <ErrorMsg>{ error.errorMessage }</ErrorMsg> : null
          }
          {
            this.state.expanded
              && <DataNodeList data={targets} api={api} endpoint={endpoint} />
          }
        </div>
      </ContextMenuTrigger>

      <ContextMenu id={MENU}>
      <MenuItem data={{item: data.displayName}} onClick={this.handleClick}>
          Read1
      </MenuItem>
      <MenuItem onClick={this.handleClick}>
          Write2
      </MenuItem>
      </ContextMenu>
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
