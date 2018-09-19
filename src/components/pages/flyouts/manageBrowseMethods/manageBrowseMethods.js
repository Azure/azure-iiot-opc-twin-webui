// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { LinkedComponent, svgs, isDef } from 'utilities';
import { OpcTwinService } from 'services';
import { Indicator } from 'components/shared';

import { 
  FormControl,
  Btn, 
  BtnToolbar,
  FormGroup,
  FormLabel,
  FormSection,
  SectionDesc,
  SectionHeader,
  Protected 
} from 'components/shared';

import Flyout from 'components/shared/flyout';
//import DeviceGroupForm from './views/deviceGroupForm';
//import DeviceGroups from './views/deviceGroups';

import './manageBrowse.css';

const Json = ({ children }) => <pre>{JSON.stringify(children, null, 2) }</pre>;
const actionType = ['read', 'write', 'method'];

const initialState = {
  isPending: false,
  error: undefined,
  changesApplied: false,
  methodName: undefined
};

const readState = { value: '' };

//export class ManageDeviceGroups extends LinkedComponent {
export class ManageBrowseMethods extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      action: '',
      changesApplied: false,
      isPending: false,
      value: {}
    };

    this.actionLink = this.linkTo('action').map(({ value }) => value);
  }

  //fetchValue = (endpointId, nodeId) => this.componentRef.props.fetchValue(endpointId, nodeId);

  apply = (event) => {
    event.preventDefault();
  
      this.setState({ isPending: true });

      const { endpoint, data, api } = this.props;

      api.fetchValue(endpoint, data.id);
     
      const pending = api.isReadPending(endpoint, data.id);

      /* OpcTwinService.readNodeValue(endpoint, data.id)
        .then(res => {
          return res.json()
          }).then(response => {
          this.setState({value: response.value})
      }) */

        /* .subscribe(
          () => {
            this.setState({ isPending: false, changesApplied: true });
          },
          error => {
            this.setState({ error, isPending: false, changesApplied: true });
          }
        );  */
        const xx =1;
        this.setState({ changesApplied: true });

  }


  render() {
    const { t, onClose, api, values, endpoint, data } = this.props;
    const { isPending, changesApplied, value } = this.state;

    let pending = api.isReadPending();

    const actionOptions = actionType.map((value) => ({
      label: t(`browseFlyout.options.${value}`),
      value
    }));


    if (isDef(api.isReadPending()) || (api.isReadPending() == true)) {
      pending = true;
    } else {
      pending = false;
    }

    return (
      <Flyout.Container>
        <Flyout.Header>
          <Flyout.Title>{t('browseFlyout.title')}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content className="browse-container">
          <form onSubmit={this.apply}>
            <FormSection className="browse-container">
              {/* <SectionHeader>{t('browseFlyout.title')}</SectionHeader> */}
              <SectionDesc>{''}</SectionDesc>

              <FormGroup>
                <FormLabel>{t('browseFlyout.selectAction')}</FormLabel>
                <FormControl
                      type="select"
                      className="browse-dropdown"
                      options={actionOptions}
                      searchable={false}
                      clearable={false}
                      placeholder={'Select'}
                      link={this.actionLink} />
              </FormGroup>
              {
                !changesApplied &&
                <BtnToolbar>
                  <Btn svg={svgs.reconfigure} primary={true} disabled={ isPending } type="submit">{t('browseFlyout.apply')}</Btn>
                  <Btn svg={svgs.cancelX} onClick={onClose}>{t('browseFlyout.close')}</Btn>
                </BtnToolbar>
              }
              {
                changesApplied &&
                <BtnToolbar>
                  <Btn svg={svgs.cancelX} onClick={onClose}>{t('browseFlyout.close')}</Btn>
                </BtnToolbar>

              }
              { api.isReadPending() ? <Indicator /> : null }
              { changesApplied && <Json>{ values }</Json> } 
                 
              
              
          </FormSection>
          </form>
        </Flyout.Content>
      </Flyout.Container> 
    );
  }
}
