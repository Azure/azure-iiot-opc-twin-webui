// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { ErrorMsg, 
  Indicator, 
  ContextMenu, 
  PageContent, 
  Radio,
  Btn,
  RefreshBar} from 'components/shared';
import { isDef, LinkedComponent } from 'utilities';

import { 
  pendingApplications, 
  pendingEndpoints, 
  pendingNode, 
  pendingRead} from 'store/reducers/appReducer';

import { ManageBrowseMethodsContainer } from './flyouts/manageBrowseMethods';
import { OpcTwinService } from 'services';
import { toScanModel } from 'services/models';
import './start.css';

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
  isReadPending = () => this.isPending(pendingRead());

  // Action creator wrappers
  fetchApplications = () => this.componentRef.props.fetchApplications();
  fetchEndpoints = (applicationId) => this.componentRef.props.fetchEndpoints(applicationId);
  fetchNode = (endpointId, nodeId) => this.componentRef.props.fetchNode(endpointId, nodeId);
  fetchTwins = () => this.componentRef.props.fetchTwins();
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

  closeFlyout = () => {this.setState(closedFlyoutState);}

  openBrowseFlyout = () => this.setState({ openFlyoutName: 'Browse' });

  toggle = () => {
    const { data, api, endpoint } = this.props;

    if (data.nodeClass === "Method") {
      this.openBrowseFlyout();
    }
    else if (data.children){
      // TODO: Prevent calling again if pending state is active
      if (!isDef(api.getReferences(endpoint, data.id))) api.fetchNode(endpoint, data.id);
      this.setState({ expanded: !this.state.expanded });
    }
    else {
      this.openBrowseFlyout();
    }
  }

  render() {
    const { data, api, endpoint } = this.props;
    const targets = (api.getReferences(endpoint, data.id) || [])
      .map(targetId => api.getNode(endpoint, targetId));
      const error = api.isNodeError(endpoint, data.id);

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
          <div>
            {"node type: " }
            {data.nodeClass}
          </div>
        </div>
        {
          error ? <ErrorMsg>{ error.errorMessage }</ErrorMsg> : null
        }
        {
          this.state.expanded
             && <DataNodeList data={targets} api={api} endpoint={endpoint} />
        }    
        { browseFlyoutOpen && <ManageBrowseMethodsContainer onClose={this.closeFlyout} endpoint={endpoint} data={data} api={api} /> }     
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
    this.state = { 
      expanded: false,
      error: undefined,
      isPending: false
     };
  }

  toggle = () => {
    const { data, api } = this.props;
    // TODO: Prevent calling again if pending state is active
    if (!isDef(api.getReferences(data.id))) api.fetchNode(data.id);
    this.setState({ expanded: !this.state.expanded });
  }

  radioChange = (event) => {
    const { data, api } = this.props;
    event.preventDefault();
    this.setState({ isPending: true });

    if (event.target.value !== "true") {
      this.subscription = OpcTwinService.activateTwin(data.id)
      .subscribe(
        () => {
          this.setState({ isPending: false });
          api.fetchTwins();
        },
        error => this.setState({ error })
      );
    }
    else {
      this.subscription = OpcTwinService.deactivateTwin(data.id)
      .subscribe(
        () => {
          this.setState({ isPending: false });
          api.fetchTwins();
        },
        error => this.setState({ error })
      );
    }  
  }

  isActive () {
    const { data, twinData } = this.props;
    const value = twinData.filter(item => item.endpointId === data.id)
      .map(item => item.activated)[0] === true ? true : false;
    return value;
  }

  render() {
    const { data, api } = this.props;
    const { isPending } = this.state;
    const [_, policy] = data.endpoint.securityPolicy.split('#');
    const rootNode = api.getNode(data.id, api.getReferences(data.id));
    const error = api.isNodeError(data.id);

    return (
      <div className="hierarchy-level">
        {
          <Radio checked={this.isActive() === true} value={this.isActive()} onClick={this.radioChange}>
            <div className="text-radio-button"> {'active'}  {isPending ? <Indicator size="small" /> : null} </div>
           </Radio>
        }
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

const EndpointNodeList = ({ data, api, twinData }) => data.map(endpointId =>
  <EndpointNode data={api.getEndpoint(endpointId)} api={api} key={endpointId} twinData={twinData}/>
);

class ApplicationNode extends Component {

  constructor(props) {
    super(props);
    this.state = { expanded: false };
    this.state = { error: undefined };
  }


  toggle = () => {

    const { data, api } = this.props;
    // TODO: Prevent calling again if pending state is active
    if (!isDef(data.endpoints)) api.fetchEndpoints(data.applicationId);
    this.setState({ expanded: !this.state.expanded });
  }

  deleteApplication = (applicationId) => {
    const { api } = this.props;

    this.subscription = OpcTwinService.deleteApplication(applicationId)
      .subscribe(
        () => {
          api.fetchApplications();
          api.fetchTwins();
        },
        error => this.setState({ error })
      ); 
  }

  render() {
    const { data, api, twinData } = this.props;
    const error = api.isEndpointsError(data.applicationId);

    return (
      <div className="hierarchy-level">
        <div className="hierarchy-name" onClick={this.toggle}>
          {data.applicationName} <Expander expanded={this.state.expanded} />
          { api.isEndpointsPending(data.applicationId) ? <Indicator /> : null }
          <div className="node-details">
            {data.applicationUri} 
          </div> 
        </div>
        <div className="btn-delete-container">
          <Btn value={data.applicationId} onClick={() => this.deleteApplication(data.applicationId)}>{'Delete'}</Btn>
        </div>
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        {
          this.state.expanded && data.endpoints && data.endpoints.length
            ? <EndpointNodeList data={data.endpoints} api={api} twinData={twinData} />
            : null
        }
      </div>
    );
  }
}

const ApplicationNodeList = ({ data, api, twinData }) => data.map((app, idx) => (
  <ApplicationNode
    data={app}
    api={api}
    twinData={twinData}
    key={app.applicationId} />
));

export class Start extends Component {
  constructor(props) {
    super(props);

    this.state = { error: undefined };

    this.nodeApi = new NodeApi(this);
  };

  componentDidMount () {
    this.refreshApplications();
  }

  refreshApplications = () => {
    this.props.fetchApplications();
    this.props.fetchTwins();
  }

  startScan = () => {
    this.subscription = OpcTwinService.scanServers(JSON.stringify(toScanModel("Fast"), null, 2))
      .subscribe(
        () => {},
        error => this.setState({ error })
      );
  }

  render() {
    const { applications, twins, errors } = this.props;

    return [
      <ContextMenu key="context-menu">
        <Btn className="btn-scan" onClick={this.startScan}>{'Scan'}</Btn>
        <RefreshBar  refresh={this.refreshApplications}/> 
      </ContextMenu>,
      <PageContent className="start-container" key="page-content">
        { this.nodeApi.isApplicationsPending() && <Indicator /> }
        <ApplicationNodeList data={applications} twinData={twins} api={this.nodeApi} />
      </PageContent>
    ];
  }
}

class CheckBox extends React.Component {
    
  render() {
      return (
        <input type="checkbox" id={this.props.id} value={this.props.value} onChange={this.props.onChange} />
      )
  }
  
}
