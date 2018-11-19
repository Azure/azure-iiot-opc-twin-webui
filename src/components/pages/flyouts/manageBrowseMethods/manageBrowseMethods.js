// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { LinkedComponent, svgs, isDef, Validator } from 'utilities';
import { TwinService } from 'services';
import Config from 'app.config';

import { 
  FormControl,
  Btn, 
  BtnToolbar,
  FormGroup,
  Indicator,
  FormLabel,
  FormSection,
  SectionDesc,
  SectionHeader,
  SummaryBody,
  SummarySection
} from 'components/shared';

import Flyout from 'components/shared/flyout';
import './manageBrowse.css';
import { 
  toWriteValueModel,
  toCallNodeMethodMetadataModel,
  toCallNodeMethodModel
} from 'services/models';

const Json = ({ children }) => <pre>{JSON.stringify(children, null, 2) }</pre>;
const actionType = [];
const isNumeric = value => !isNaN(parseInt(value, 10));

const READ = 'read';
const WRITE = 'write';
const CALL = 'call';

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
      metadataCall: {},
      isAccessible: true,
      changes: false
    };

    this.checkAccessLevel();
    this.actionLink = this.linkTo('action').map(({ value }) => value);
    this.writeValueLink = this.linkTo('writeValue')
      .check(Validator.notEmpty, () => this.props.t('browseFlyout.validation.required'));
    this.argumentLinks = [];
  }

  formIsValid() {
    return [
      this.writeValueLink
    ].every(link => !link.error);
  }

  setErrorState = (error) => {
    this.setState({ error });
    this.setState({ isPending: false });
  }

  apply = (event) => {
    event.preventDefault();
  
    this.setState({ isPending: true });

    const { endpoint, data, t } = this.props;

    switch (this.actionLink.value) {
      case READ:
        this.subscription = TwinService.readNodeValue(endpoint, data.id)
        .subscribe(
          (response) => {
            this.setState({ value: response.value })
            this.setState({ isPending: false });
          },
          error => this.setErrorState(error)
        );
      break;
      case WRITE:
        if ((data.dataType.includes('Int') || data.dataType === 'Double') && !isNumeric(this.writeValueLink.value)) {  
          this.setState({ isPending: false });
          this.setState({ error: {message: t('browseFlyout.validation.NaN')} });
          break;
        }  

        this.subscription = TwinService.writeNodeValue(endpoint, JSON.stringify(toWriteValueModel(data, this.writeValueLink.value), null, 2))
        .subscribe(
          (response) => {
            this.setState({ isPending: false });
          },
          error => this.setErrorState(error)
        );
      break;
      case CALL:
        const { metadataCall } = this.state;  

        this.subscription = TwinService.callNodeMethod(endpoint, JSON.stringify(toCallNodeMethodModel(metadataCall, data.id, this.argumentLinks), null, 2))
        .subscribe(
          (response) => {
            this.setState({ value: response.value });
            this.setState({ isPending: false });
          },
          error => this.setErrorState(error)
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
    this.state = { isAccessible: true };
 
    if (data.nodeClass === Config.nodeProperty.method)
    {
      actionType.push(CALL);
    }
    else if (data.accessLevel !== undefined) {
      if (data.accessLevel.includes(Config.nodeProperty.read)) {
        actionType.push(READ);
      }
      if (data.accessLevel.includes(Config.nodeProperty.write)) {
        actionType.push(WRITE);
      }
    }
    else {
      this.state = { isAccessible: false };
    }
  }

  selectionisValid() {
    return this.actionLink.value !== ""; 
  }

  isWrite () {
    return this.actionLink.value === WRITE; 
  }

  isRead () {
    return this.actionLink.value === READ; 
  }

  isCall () {
    return this.actionLink.value === CALL; 
  }

  getCallMetadata () {
    const { endpoint, data } = this.props;
    const { inputArguments } = this.state;

    if ((this.actionLink.value === CALL) && !isDef(inputArguments))  {
      this.subscription = TwinService.callNodeMethodMetadata(endpoint, JSON.stringify(toCallNodeMethodMetadataModel(data), null, 2))
        .subscribe(
          (response) => {
            this.setState({ inputArguments: response.inputArguments });
            this.setState({ metadataCall: response });
            response.inputArguments.map((_, index) => [
              this.argumentLinks.push(this.linkTo('argumentvalue'+ index)
                .check(Validator.notEmpty, () => this.props.t('browseFlyout.validation.required')))
            ]);           
            this.setState({ isPending: true });
          },
          error => this.setState({ error })
        );
    }
  }

  linkChange = () => {
      this.setState({ changesApplied: false });
  }

  render() {
    const { t, onClose, data } = this.props;
    const { isPending, changesApplied, value, inputArguments, error, isAccessible } = this.state;

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
              <SectionDesc>{data.description !== undefined ? data.description : t('browseFlyout.nodeName')}</SectionDesc>
              {
                isAccessible ? 
                <FormGroup>
                  <FormLabel>{t('browseFlyout.selectAction')}</FormLabel>
                  <FormControl
                        type="select"
                        className="long"
                        options={actionOptions}
                        searchable={false}
                        clearable={false}
                        link={this.actionLink}
                        onChange={this.linkChange} />
                </FormGroup>
                : <SectionHeader>{t('browseFlyout.noAccess')}</SectionHeader>
              }
              { 
                this.isWrite() &&
                <FormGroup>
                  <FormLabel>{t('browseFlyout.value')}</FormLabel>
                  <div className="help-message">{t('browseFlyout.writeMessage')}</div>
                  <FormControl className="long" link={this.writeValueLink} type="text" placeholder={data.dataType} />
                </FormGroup>
              }
              {
               !changesApplied && this.isCall() && inputArguments !== undefined &&
                <SummarySection>
                {inputArguments.length !== 0 && <SectionHeader>{'Set call arguments'}</SectionHeader>}
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
                  {isAccessible && 
                    <Btn 
                      svg={svgs.reconfigure} 
                      primary={true} 
                      disabled={ !this.selectionisValid() || (!this.formIsValid() && this.isWrite())} 
                      type="submit">
                      {t('browseFlyout.apply')}
                    </Btn>}
                  <Btn svg={svgs.cancelX} onClick={onClose}>{t('browseFlyout.close')}</Btn>
                </BtnToolbar>
              }
              {
                changesApplied &&
                <BtnToolbar>
                  {isAccessible && 
                    <Btn 
                      svg={svgs.reconfigure} 
                      primary={true} 
                      disabled={ !this.selectionisValid() } 
                      type="submit">
                      {t('browseFlyout.apply')}
                    </Btn>}
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
