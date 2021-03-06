// Copyright (c) Microsoft. All rights reserved.

import { HttpClient } from './httpClient';
import { getItems } from 'utilities';
import Config from 'app.config';

const ENDPOINT_REGISTRY = Config.serviceUrls.registry;

/**
 * Contains methods for calling the device simulation microservice
 */
export class RegistryService {

  /**
   * Returns a list of devicemodels
   */
  static getApplicationsList() {
    const value = HttpClient.get(`${ENDPOINT_REGISTRY}/v2/applications`, undefined)
      .map(getItems);
    return value;
  }

  static getApplication(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v2/applications/${id}`, undefined);
  }

  static getTwins() {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v2/endpoints`, undefined);
  }

  static activateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v2/endpoints/${endpointId}/activate`, payload);
  }

  static deactivateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v2/endpoints/${endpointId}/deactivate`, payload);
  }

  static scanServers(payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v2/applications/discover`, payload);
  }

  static deleteApplication(applicationId) {
    return HttpClient.delete(`${ENDPOINT_REGISTRY}/v2/applications/${applicationId}`);
  }

  static getSupervisorsList() {
    const serverStateString = `?onlyServerState=true`;
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v2/supervisors${serverStateString}`, undefined)
      .map(getItems);
  }

  static getSupervisor(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v2/supervisors/${id}`, undefined);
  }

  static updateSupervisor(id, payload) {
    return HttpClient.patch(`${ENDPOINT_REGISTRY}/v2/supervisors/${id}`, payload);
  }
}
