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
  SummaryBody,
  SummarySection
} from 'components/shared';

import Flyout from 'components/shared/flyout';
//import DeviceGroupForm from './views/deviceGroupForm';
//import DeviceGroups from './views/deviceGroups';

import './manageBrowse.css';
import { toWriteValueModel } from 'services/models';

const Json = ({ children }) => <pre>{JSON.stringify(children, null, 2) }</pre>;
const actionType = [];

/* const initialState = {
  isPending: false,
  error: undefined,
  changesApplied: false,
  methodName: undefined
}; */

export class ManageBrowseMethods extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      action: '',
      changesApplied: false,
      isPending: false,
      value: {},
      error: {}
    };

    this.checkAccessLevel();
    this.actionLink = this.linkTo('action').map(({ value }) => value);
    this.writeValueLink = this.linkTo('writeValue');
  }

  apply = (event) => {
    event.preventDefault();
  
      this.setState({ isPending: true });

      const { endpoint, data, api } = this.props;

      switch (this.actionLink.value) {
        case 'read':
          //api.fetchValue(endpoint, data.id);
          this.subscription = OpcTwinService.readNodeValue(endpoint, data.id)
          .subscribe(
            (response) => {
              this.setState({ value: response.value })
              this.setState({ isPending: false });
            },
            error => this.setState({ error })
          );
          this.setState({ isPending:  api.isReadPending()});
        break;
        case 'write':
          this.subscription = OpcTwinService.writeNodeValue(endpoint, JSON.stringify(toWriteValueModel(data, parseInt(this.writeValueLink.value)), null, 2))
          .subscribe(
            () => {},
            error => this.setState({ error })
          );
        break;
        case 'call':
        break;
      }
        this.setState({ changesApplied: true });
  }

  checkAccessLevel = () => {
    const { data } = this.props;

    actionType.length = 0;

    if (data.accessLevel.includes("Read")) {
      actionType.push('read');
    }
    if (data.accessLevel.includes("Write")) {
      actionType.push('write');
    }
  }

  selectionisValid() {
    return this.actionLink.value != ""; 
  }

  isWrite () {
    return this.actionLink.value == "write"; 
  }

  render() {
    const { t, onClose, api, data } = this.props;
    const { isPending, changesApplied, value } = this.state;

    const actionOptions = actionType.map((value) => ({
      label: t(`browseFlyout.options.${value}`),
      value
    }));

    return (
      <Flyout.Container>
        <Flyout.Header>
          <Flyout.Title>{t('browseFlyout.title')}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content className="browse-container">
          <form onSubmit={this.apply}>
            <FormSection className="browse-container">
              <SectionHeader>{data.displayName}</SectionHeader>
              <SectionDesc>{t('browseFlyout.nodeName')}</SectionDesc>

              <FormGroup>
                <FormLabel>{t('browseFlyout.selectAction')}</FormLabel>
                <FormControl
                      type="select"
                      className="long"
                      options={actionOptions}
                      searchable={false}
                      clearable={false}
                      placeholder={'Select'}
                      link={this.actionLink} />
              </FormGroup>

              { 
                this.isWrite() &&
                <FormGroup>
                  <FormLabel>{t('browseFlyout.value')}</FormLabel>
                  <div className="help-message">{t('browseFlyout.writeMessage')}</div>
                  <FormControl className="long" link={this.writeValueLink} type="text" placeholder={t('browseFlyout.writeMessage')} />
                </FormGroup>
              }
              {
                changesApplied && 
                <SummarySection>
                <SectionHeader>{t('browseFlyout.value')}</SectionHeader>
                  <SummaryBody>
                  
                    <SectionDesc>
                      { isPending ? <Indicator /> : null }
                      { changesApplied && <Json>{ value }</Json> } 
                    </SectionDesc>
                  </SummaryBody>
                </SummarySection>
              }
              {
                !changesApplied &&
                <BtnToolbar>
                  <Btn svg={svgs.reconfigure} primary={true} disabled={ !this.selectionisValid() } type="submit">{t('browseFlyout.apply')}</Btn>
                  <Btn svg={svgs.cancelX} onClick={onClose}>{t('browseFlyout.close')}</Btn>
                </BtnToolbar>
              }
              {
                changesApplied &&
                <BtnToolbar>
                  <Btn svg={svgs.cancelX} onClick={onClose}>{t('browseFlyout.close')}</Btn>
                </BtnToolbar>
              }
          </FormSection>
          </form>
        </Flyout.Content>
      </Flyout.Container> 
    );
  }
}
