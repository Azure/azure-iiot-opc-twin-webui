// Copyright (c) Microsoft. All rights reserved.

import { HttpClient } from './httpClient';
import { toReadValueModel } from './models';
import Config from 'app.config';

const ENDPOINT_OPC_TWIN = Config.serviceUrls.opcTwin;

/**
 * Contains methods for calling the device simulation microservice
 */
export class TwinService {

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
}
