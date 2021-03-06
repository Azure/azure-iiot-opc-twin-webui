// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import moment from 'moment';
import { 
  ErrorMsg, 
  Indicator, 
  ContextMenu, 
  PageContent, 
  Radio,
  Btn,
  RefreshBar,
  ToggleBtn,
  NodeApi, 
  Expander
} from 'components/shared';

import { isDef } from 'utilities';
import { EndpointDropdown } from 'components/app/endpointDropdown';
import { ManageBrowseMethodsContainer } from './flyouts/manageBrowseMethods';
import { RegistryService} from 'services';
import { toScanSupervisorModel } from 'services/models';
import './start.css';
import Config from 'app.config';

const closedFlyoutState = { openFlyoutName: undefined };

class DataNode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      ...closedFlyoutState,
      path: undefined,
      showSpinner: false
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.update(), 15000);
  } 

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  update () {
    const { data, api, endpoint } = this.props;
    if (this.state.expanded) {
      api.fetchNode(endpoint, data.nodeId);
      api.fetchPublishedNodes(endpoint);
    }
  }

  closeFlyout = () => {this.setState(closedFlyoutState);}

  openBrowseFlyout = () => this.setState({ openFlyoutName: 'Browse' });

  toggle = () => {
    const { data, api, endpoint, path } = this.props;

    if (data.children){
      if (!isDef(api.getReferences(endpoint, data.nodeId))){
        api.fetchNode(endpoint, data.nodeId);
        api.fetchPublishedNodes(endpoint);
      } 

      this.setState({ expanded: !this.state.expanded });

      if (!this.state.expanded) {
        this.setState({ showSpinner: true });
      }
    }
    
    const currentPath = api.fetchPath(path + '/' + data.displayName);
    this.setState({path: currentPath.payload});
  }

  onClickAction = () => {
    const { data } = this.props;

    if (data.nodeClass === Config.nodeProperty.method) {
      this.openBrowseFlyout();
    }
    else if (data.nodeClass === Config.nodeProperty.variable) {
      this.openBrowseFlyout();
    } 
  }

  render() {
    const { data, api, endpoint, label, t, publishedNodes } = this.props;
    const { path, showSpinner } = this.state;
    const targets = (api.getReferences(endpoint, data.nodeId) || [])
      .map(targetId => api.getNode(endpoint, targetId));
    const error = api.isNodeError(endpoint, data.nodeId);

    const browseFlyoutOpen = this.state.openFlyoutName === 'Browse';

    const isPublished = publishedNodes.some((x) =>  { return x.nodeId === data.nodeId; });

    return (
      <div className="hierarchy-level">
        {
          label !== undefined ? <div>{label}</div> : null
        }
        <div className="hierarchy-name" >
          { data.children ? <Expander expanded={this.state.expanded} onClick={this.toggle} /> : <div className="hierarchy-space"/> }
          <div className="node-name" onClick={this.onClickAction}>{ data.displayName } </div> 
          { (api.isNodePending(endpoint, data.nodeId) && showSpinner) ? <Indicator /> : (showSpinner ? this.setState({ showSpinner: false }) : null) }
        </div>
        <div className="node-details">
          { data.description }
          <div>
            <div>
              {t('explorerLabel.nodeType')}
              {data.nodeClass}
            </div>
            <div className="node-value"> 
              {data.value !== undefined && data.children === false  && <label>{t('explorerLabel.value')}{String(data.value)}</label> }
            </div>
            <span className="node-published">
              { isPublished ? t('explorerLabel.published') : null}
            </span>  
          </div>
        </div>
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        {
          this.state.expanded
             && <DataNodeList 
                  data={targets} 
                  api={api} 
                  endpoint={endpoint} 
                  path={path}
                  publishedNodes={publishedNodes} 
                  t={t}/>
        }    
        { browseFlyoutOpen && <ManageBrowseMethodsContainer onClose={this.closeFlyout} endpoint={endpoint} data={data} api={api} isPublished={isPublished}/> }     
      </div>
    );
  }
}

const DataNodeList = ({ data, api, endpoint, path, t, publishedNodes }) => data.map(node => (
  <DataNode 
    data={node} 
    api={api} 
    endpoint={endpoint} 
    key={node.id} 
    path={path}
    publishedNodes={publishedNodes}
    t={t} />
));

class EndpointNode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      error: undefined,
      isPending: false,
      path: undefined,
      security: 0
     };
  }

  toggle = () => {
    const { data, api, path } = this.props;

    if (!isDef(api.getReferences(data.id))) api.fetchNode(data.id);
    this.setState({ expanded: !this.state.expanded });

    const currentPath = api.fetchPath('/' + path + '/' + data.endpoint.url);
    this.setState({path: currentPath.payload});
  }

  radioChange = (event) => {
    const { data, api } = this.props;
    event.preventDefault();
    this.setState({ isPending: true });

    if (event.target.value !== "true") {
      this.subscription = RegistryService.activateTwin(data.id)
      .subscribe(
        (response) => {
          this.setState({ isPending: false });
          api.fetchTwins();
        },
        error => this.setState({ error })
      );
    }
    else {
      this.subscription = RegistryService.deactivateTwin(data.id)
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
    const { data, twins } = this.props;
    const value = twins.filter(item => item.endpointId === data.id)
      .map(item => item.activated)[0] === true ? true : false;
    return value;
  }

  isVisible() {
    const { data, appData } = this.props;
    return (appData.endpoints.includes(data.id));
  }

  render() {
    const { data, api, t, publishedNodes } = this.props;
    const { isPending, path } = this.state;
    const [_, policy] = data.endpoint.securityPolicy.split('#');
    const rootNode = api.getNode(data.id, api.getReferences(data.id));
    const error = api.isNodeError(data.id);
  
    return (
      this.isVisible() &&
      <div className="hierarchy-level">
        {
          <Radio className="radio-container" checked={this.isActive() === true} value={this.isActive()} onClick={this.radioChange}>
             <div className="text-radio-button"> {t('activateEndpoint')}  {isPending ? <Indicator size="small" /> : null} </div>
          </Radio>
        }
        <div className="hierarchy-name">
          {t('explorerLabel.endpoint')}<br />
          {this.isActive() 
            ? <Expander expanded={this.state.expanded} onClick={this.isActive() && this.toggle}/>
            : <div className="hierarchy-space"/>
          } 
          {data.endpoint.url} 
          { api.isNodePending(data.id) ? <Indicator /> : null }
        </div>
        <div className="node-details">
          {t('securityMode')}{data.endpoint.securityMode}
        </div>
        <div className="node-details">
          {t('securityPolicy')}{policy}
        </div>
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        {
          this.state.expanded
            && rootNode
            && <DataNode 
              data={rootNode} 
              api={api} 
              endpoint={data.id} 
              path={path}
              publishedNodes={publishedNodes} 
              t={t} 
              label={t('explorerLabel.node')}/>
        }
      </div>
    );
  }
}

const EndpointNodeList = ({ data, api, twins, path, appData, t, publishedNodes }) => data.map((endpointId, index) =>
  <EndpointNode 
    data={data[index]}
    api={api} 
    key={endpointId} 
    twins={twins} 
    path={path}
    appData={appData}
    publishedNodes={publishedNodes}
    t={t} />
);

class ApplicationNode extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      isPending: false,
      error: undefined
    };
  }

  componentWillReceiveProps(props) {
    const { supervisorId, api, refresh } = this.props;

    if (props.refresh !== refresh) {
      api.fetchApplications(supervisorId);
      api.fetchTwins();
    
      this.setState({ expanded: false });
    }
  }

  toggle = () => {
    const { applicationData, api, path } = this.props;

    if (!isDef(applicationData.endpoints)) api.fetchEndpoints(applicationData.applicationId);
    this.setState({ expanded: !this.state.expanded });

    const currentPath = api.fetchPath('/' + path + '/' + applicationData.applicationName);
    this.setState({path: currentPath.payload});
  }

  deleteApplication = (applicationId) => {
    const { api, supervisorId } = this.props;

    this.setState({ isPending: true });
    this.subscription = RegistryService.deleteApplication(applicationId)
      .subscribe(
        () => {
          api.fetchApplications(supervisorId);
          api.fetchTwins();
          this.setState({ isPending: false });
        },
        error => this.setState({ error })
      ); 
  }

  isVisible() {
    const { supervisorId, applicationData } = this.props;
    
    return applicationData.supervisorId.includes(supervisorId) 
  }

  render() {
    const { t, applicationData, api, twins, filteredEndpoints, publishedNodes } = this.props;
    const { isPending } = this.state;
    const error = api.isEndpointsError(applicationData.applicationId);

    return (
      this.isVisible() &&
      <div className="hierarchy-level">
        <div className="hierarchy-name">
          {t('explorerLabel.server')}<br />
          <Expander expanded={this.state.expanded} onClick={this.toggle} />{applicationData.applicationName} 
          { api.isEndpointsPending(applicationData.applicationId) ? <Indicator /> : null }
          <div className="node-details">
            {applicationData.applicationUri} 
          </div> 
        </div>
        <div className="btn-delete-container">
          <Btn 
            value={applicationData.applicationId} 
            onClick={() => this.deleteApplication(applicationData.applicationId)}>
            {t('delete')}
            {isPending ? <Indicator size="small" /> : null}
          </Btn>
        </div>
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        {
          this.state.expanded && applicationData.endpoints && applicationData.endpoints.length
            ? <EndpointNodeList 
                data={filteredEndpoints} 
                api={api} 
                twins={twins} 
                path={applicationData.applicationName} 
                appData={applicationData}
                publishedNodes={publishedNodes}
                t={t} />
            : null
        }
      </div>
    );
  }
}

const ApplicationNodeList = ({ applicationData, api, twins, endpointFilter, filteredEndpoints, supervisorId, path, t, refresh, publishedNodes }) => applicationData.map((app, idx) => (
  <ApplicationNode
    applicationData={app}
    api={api}
    twins={twins}
    key={app.applicationId}
    endpointFilter={endpointFilter}
    filteredEndpoints={filteredEndpoints}
    supervisorId={supervisorId}
    publishedNodes={publishedNodes}
    path={path}
    t={t}
    refresh={refresh} />
));
class Supervisor extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      expanded: false,
      isPending: false,
      error: undefined,
      scanStatus: undefined
    };
  }

  componentDidMount () {
      this.checkScan(null);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.supervisorsData.discovery !== this.props.supervisorsData.discovery) {
      this.checkScan(nextProps.supervisorsData);
    }
  }

  toggle = () => {
    const { supervisorsData, api } = this.props;

    api.fetchApplications(supervisorsData.id);
    api.fetchTwins();
   
    this.setState({ expanded: !this.state.expanded });
    
    api.fetchPath('/' + supervisorsData.id);
  }

  toggleScan = (event) => {
    const { supervisorsData } = this.props;
    const data = {};

    data.discovery = event.target.value ? 'Fast' : 'Off';

    this.subscription = RegistryService.updateSupervisor(supervisorsData.id, JSON.stringify(toScanSupervisorModel(data), null, 2))
      .subscribe(
        () => {
          this.setState({ scanStatus: event.target.value })
        },
        error => this.setState(error)
      );
  }

  checkScan = (newState) => {
    const { supervisorsData } = this.props;

    if (newState === null) {
      supervisorsData.discovery === "Off" || supervisorsData.discovery === undefined ? this.setState({ scanStatus: false }) : this.setState({ scanStatus: true })
    } else {
      newState.discovery === "Off" || newState.discovery === undefined ? this.setState({ scanStatus: false }) : this.setState({ scanStatus: true })
    }
  }

  render() {
    const { t, supervisorsData, api, applicationData, twins, endpointFilter, filteredEndpoints, refresh, publishedNodes } = this.props;
    const { scanStatus } = this.state;
    const error = api.isApplicationsError(); 

    return (
      <div className="hierarchy-level">
        <div className="hierarchy-name" >
          {t('explorerLabel.supervisor')}<br />
          <Expander expanded={this.state.expanded} onClick={this.toggle} />
          {supervisorsData.id} 
          { api.isApplicationsPending() ? <Indicator /> : null }
        </div>
        <div className="toggle-scan">  
          <ToggleBtn
            value={scanStatus}
            onChange={this.toggleScan}>
            {t('scanButton.label')}
            {scanStatus ? t('scanButton.on') : t('scanButton.off')}
          </ToggleBtn>
        </div> 
        {
          error ? <ErrorMsg>{ error.message }</ErrorMsg> : null
        }
        { 
          this.state.expanded && isDef(supervisorsData) && isDef(applicationData)
          ? <ApplicationNodeList 
              applicationData={applicationData} 
              api={api} 
              twins={twins} 
              endpointFilter={endpointFilter}
              filteredEndpoints={filteredEndpoints}
              supervisorId={supervisorsData.id}
              path={supervisorsData.id}
              publishedNodes={publishedNodes}
              t={t}
              refresh={refresh} /> 
          : null
        }
      </div>
    );
  }
}

const SupervisorList = ({ supervisorsData, applicationData, api, twins, endpointFilter, filteredEndpoints, t, refresh, publishedNodes }) => supervisorsData.map((app, idx) => (
  <Supervisor
    supervisorsData={app}
    applicationData={applicationData}
    api={api}
    twins={twins}
    key={app.id}
    endpointFilter={endpointFilter}
    filteredEndpoints={filteredEndpoints}
    publishedNodes={publishedNodes}
    t={t}
    refresh={refresh} />
)); 

export class Start extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      error: undefined,
      lastRefreshed: undefined,
      refresh: false };

    this.nodeApi = new NodeApi(this);
  };

  componentDidMount () {
    this.props.fetchSupervisors();
  }

  refresh = () => {
    this.props.fetchSupervisors();
    this.props.fetchPath('');
    this.setState({lastRefreshed: moment() });
    this.setState({refresh: !this.state.refresh });
  }

  render() {
    const { t, applications, twins, endpointFilter, filteredEndpoints, path, supervisors, publishedNodes } = this.props;
    const { lastRefreshed, refresh } = this.state;

    return [
      <ContextMenu key="context-menu">
        <div className="text-path"> { path }</div> 
        <EndpointDropdown
          onChange={this.props.updateEndpointFilter}
          value={endpointFilter}
          t={t} />
        <RefreshBar  
          refresh={this.refresh}
          time={lastRefreshed}
          isPending={this.nodeApi.isSupervisorsPending()}
          t={t} /> 
      </ContextMenu>,
      <PageContent className="start-container" key="page-content">
        { this.nodeApi.isSupervisorsPending() && <Indicator /> }
        <SupervisorList 
          supervisorsData={supervisors} 
          applicationData={applications} 
          api={this.nodeApi} 
          twins={twins} 
          endpointFilter={endpointFilter}
          filteredEndpoints={filteredEndpoints}
          publishedNodes={publishedNodes} 
          t={t}
          refresh={refresh} />
      </PageContent>
    ];
  }
}
