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
    const value = HttpClient.get(`${ENDPOINT_REGISTRY}Applications`, undefined, false)
     .map(getItems);
     return value;
  }

  static getApplication(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}Applications/${id}`, undefined, false);
  }

  static getTwins() {
    return HttpClient.get(`${ENDPOINT_REGISTRY}Twins`, undefined, false);
  }

  static activateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}Twins/activate/${endpointId}`, payload);
  }

  static deactivateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}Twins/deactivate/${endpointId}`, payload);
  }

  static scanServers(payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}Applications/discover`, payload);
  }

  static deleteApplication(applicationId) {
    return HttpClient.delete(`${ENDPOINT_REGISTRY}applications/${applicationId}`);
  }

  static getSupervisorsList(serverState) {
    const serverStateString = serverState ? `?onlyServerState=${encodeURIComponent(serverState)}` : '';
    return HttpClient.get(`${ENDPOINT_REGISTRY}supervisors${serverStateString}`, undefined, false)
      .map(getItems);
  }

  static getSupervisor(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}supervisors${id}`, undefined, false);
  }

  static updateSupervisor(payload) {
    return HttpClient.patch(`${ENDPOINT_REGISTRY}supervisors`, payload);
  }
}
