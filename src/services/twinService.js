// Copyright (c) Microsoft. All rights reserved.

import { HttpClient } from './httpClient';
import { toReadValueModel } from './models';
import Config from 'app.config';

const ENDPOINT_TWINS = Config.serviceUrls.twins;

/**
 * Contains methods for calling the device simulation microservice
 */
export class TwinService {

  static browseNode(endpointId, nodeId) {
    const queryString = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
    return HttpClient.get(`${ENDPOINT_TWINS}/v2/browse/${endpointId}${queryString}`, undefined)
      .map(({ node, references }) => ({
        node,
        references
      }));
  }

  static readNodeValue(endpointId, nodeId) {
    const queryString = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
    return HttpClient.get(`${ENDPOINT_TWINS}/v2/read/${endpointId}${queryString}`, undefined)
      .map(toReadValueModel);
  }

  static writeNodeValue(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/write/${endpointId}`, payload);
  }

  static callNodeMethodMetadata(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/call/${endpointId}/metadata`, payload);
  }

  static callNodeMethod(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/call/${endpointId}`, payload);
  }

  static publishNodeValues(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/publish/${endpointId}/start`, payload);
  }

  static unPublishNodeValues(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/publish/${endpointId}/stop`, payload);
  }

  static getPublishedNodes(endpointId, payload) {
    return HttpClient.post(`${ENDPOINT_TWINS}/v2/publish/${endpointId}`, payload);
  }
}
