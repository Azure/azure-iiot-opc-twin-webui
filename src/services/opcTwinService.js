// Copyright (c) Microsoft. All rights reserved.

import { HttpClient } from './httpClient';
import { getItems } from 'utilities';
import { toReadValueModel } from './models';

const ENDPOINT_REGISTRY = 'http://localhost:9042/v1/';
const ENDPOINT_OPC_TWIN = 'http://localhost:9041/v1/';

/**
 * Contains methods for calling the device simulation microservice
 */
export class OpcTwinService {

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

  static browseNode(endpointId, nodeId) {
    const queryString = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
    return HttpClient.get(`${ENDPOINT_OPC_TWIN}Browse/${endpointId}${queryString}`, undefined, false)
      .map(({ node, references }) => ({
        node,
        references
      }))
  }

  static readNodeValue(endpointId, nodeId) {
    const queryString = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
    return HttpClient.get(`${ENDPOINT_OPC_TWIN}Read/${endpointId}${queryString}`, undefined, false)
      .map(toReadValueModel);
  }

  static writeNodeValue(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_OPC_TWIN}Write/${endpointId}`, payload);
  }

  static callNodeMethodMetadata(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_OPC_TWIN}Call/${endpointId}/$metadata`, payload);
  }

  static callNodeMethod(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_OPC_TWIN}Call/${endpointId}`, payload);
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
}
