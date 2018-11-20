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
    const value = HttpClient.get(`${ENDPOINT_REGISTRY}/v1/applications`, undefined, false)
      .map(getItems);
    return value;
  }

  static getApplication(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v1/applications/${id}`, undefined, false);
  }

  static getTwins() {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v1/endpoints`, undefined, false);
  }

  static activateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v1/endpoints/${endpointId}/activate`, payload);
  }

  static deactivateTwin(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v1/endpoints/${endpointId}/deactivate`, payload);
  }

  static scanServers(payload) {
    return HttpClient.post(`${ENDPOINT_REGISTRY}/v1/applications/discover`, payload);
  }

  static deleteApplication(applicationId) {
    return HttpClient.delete(`${ENDPOINT_REGISTRY}/v1/applications/${applicationId}`);
  }

  static getSupervisorsList(serverState) {
    const serverStateString = serverState ? `?onlyServerState=${encodeURIComponent(serverState)}` : '';
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v1/supervisors${serverStateString}`, undefined, false)
      .map(getItems);
  }

  static getSupervisor(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}/v1/supervisors${id}`, undefined, false);
  }

  static updateSupervisor(payload) {
    return HttpClient.patch(`${ENDPOINT_REGISTRY}/v1/supervisors`, payload);
  }
}
