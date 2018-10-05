// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { LinkedComponent, svgs, isDef } from 'utilities';
import { OpcTwinService } from 'services';
import { Indicator } from '../../../shared';

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
} from '../../../shared';

import Flyout from '../../../shared/flyout';
import './manageBrowse.css';
import { 
  toWriteValueModel,
  toCallNodeMethodMetadataModel,
  toCallNodeMethodModel
} from 'services/models';

const Json = ({ children }) => <pre>{JSON.stringify(children, null, 2) }</pre>;
const actionType = [];

export class ManageBrowseMethods extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      action: '',
      changesApplied: false,
      isPending: false,
      value: undefined,
      error: undefined,
      inputArguments: [],
      metadataCall: {}
    };

    this.checkAccessLevel();
    this.actionLink = this.linkTo('action').map(({ value }) => value);
    this.writeValueLink = this.linkTo('writeValue');
    this.argumentLinks = [];
  }

  apply = (event) => {
    event.preventDefault();
  
      this.setState({ isPending: true });

      const { endpoint, data, api } = this.props;

      switch (this.actionLink.value) {
        case 'read':
          this.subscription = OpcTwinService.readNodeValue(endpoint, data.id)
          .subscribe(
            (response) => {
              this.setState({ value: response.value })
              this.setState({ isPending: false });
            },
            error => this.setState({ error })
          );
        break;
        case 'write':
          this.subscription = OpcTwinService.writeNodeValue(endpoint, JSON.stringify(toWriteValueModel(data, this.writeValueLink.value), null, 2))
          //this.subscription = OpcTwinService.writeNodeValue(endpoint, JSON.stringify(toWriteValueModel(data, null), null, 2))
          .subscribe(
            (response) => {
              this.setState({ isPending: false });
            },
            error => this.setState({ error })
          );
        break;
        case 'call':
          const { metadataCall } = this.state;  

          this.subscription = OpcTwinService.callNodeMethod(endpoint, JSON.stringify(toCallNodeMethodModel(metadataCall, data.id, this.argumentLinks), null, 2))
          .subscribe(
            (response) => {
              this.setState({ value: response.value })
              this.setState({ isPending: false });
            },
            error => this.setState({ error }) 
          );
        break;
        default:
        break;
      }
      this.setState({ changesApplied: true });
  }

  checkAccessLevel = () => {
    const { data } = this.props;

    actionType.length = 0;
 
    if (data.nodeClass === "Method")
    {
      actionType.push('call');
    }
    else {
      if (data.accessLevel.includes("Read")) {
        actionType.push('read');
      }
      if (data.accessLevel.includes("Write")) {
        actionType.push('write');
      }
    }
  }

  selectionisValid() {
    return this.actionLink.value !== ""; 
  }

  isWrite () {
    return this.actionLink.value === "write"; 
  }

  isRead () {
    return this.actionLink.value === "read"; 
  }

  isCall () {
    return this.actionLink.value === "call"; 
  }

  getCallMetadata () {
    const { endpoint, data, api } = this.props;
    const { inputArguments } = this.state;

    let value = false;
    if ((this.actionLink.value === "call") && !isDef(inputArguments))  {
      //this.setState({ isPending: true });
      this.subscription = OpcTwinService.callNodeMethodMetadata(endpoint, JSON.stringify(toCallNodeMethodMetadataModel(data), null, 2))
        .subscribe(
          (response) => {
            this.setState({ inputArguments: response.inputArguments });
            this.setState({ metadataCall: response });
            response.inputArguments.map((_, index) => [
              this.argumentLinks.push(this.linkTo('argumentvalue'+ index))
            ]);           
            this.setState({ isPending: true });
          },
          error => this.setState({ error })
        );
    }
  }

  render() {
    const { t, onClose, api, data } = this.props;
    const { isPending, changesApplied, value, inputArguments, error } = this.state;

    const actionOptions = actionType.map((value) => ({
      label: t(`browseFlyout.options.${value}`),
      value
    }));

    this.getCallMetadata()
 
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
                  <FormControl className="long" link={this.writeValueLink} type="text" placeholder={data.dataType} />
                </FormGroup>
              }
              {
               !changesApplied && this.isCall() &&
                <SummarySection>
                {inputArguments.length!=0 && <SectionHeader>{'Set call arguments'}</SectionHeader>}
                { 
                  inputArguments.map(({name, type}, index) => [
                    <FormGroup>
                      <FormLabel>{name}</FormLabel>
                      <div className="help-message">{type.description}</div>
                      <FormControl className="long" link={this.argumentLinks[index]} type="text" placeholder={type.id} />
                    </FormGroup>
                  ])
                }
                </SummarySection>
              }
              {
                changesApplied && 
                <SummarySection>
                {this.isRead() && <SectionHeader>{t('browseFlyout.value')}</SectionHeader>}
                  <SummaryBody>
                    {this.isRead() && 
                      <SectionDesc>
                        { 
                          isPending 
                            ? <Indicator /> 
                            : !isDef(error) 
                              ? <Json>{ value }</Json> 
                              : <div>{t('browseFlyout.errorMessage')} {error.message} </div> 
                        } 
                      </SectionDesc>
                    }
                    {this.isWrite() &&
                      <SectionDesc>
                        { 
                          isPending 
                            ? <Indicator /> 
                            : !isDef(error) 
                              ? <div>{t('browseFlyout.writeSuccesfully')}</div> 
                              : <div>{t('browseFlyout.errorMessage')} {error.message} </div> 
                        } 
                      </SectionDesc>
                    }
                    {this.isCall() &&
                      <SectionDesc>
                        { 
                          isPending 
                            ? <Indicator /> 
                            : !isDef(error) 
                              ? <div>{t('browseFlyout.callSuccesfully')}</div> 
                              : <div>{t('browseFlyout.errorMessage')} {error.message} </div> 
                        } 
                      </SectionDesc>
                    }
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
