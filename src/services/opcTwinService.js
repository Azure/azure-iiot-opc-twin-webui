// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';
import { HttpClient } from './httpClient';
import { getItems } from 'utilities';

const ENDPOINT_REGISTRY = 'http://localhost:9042/v1/';
const ENDPOINT_OPC_TWIN = 'http://localhost:9041/v1/';

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

let idCnt = 124;
let referenceIdCnt = 8754;
const createNodeHelper = () => {
  const count = idCnt++;
  const id = `id=${count}`;
  return {
    id,
    children: true,
    publishedNode: true,
    displayName: `node=${count}`,
    description: "string",
    nodeClass: "Object",
    isAbstract: true,
    accessLevel: "string",
    eventNotifier: "string",
    executable: true,
    dataType: "string",
    valueRank: 0
  };
};
const createReferenceHelper = () => {
  const count = referenceIdCnt++;
  return {
    id: `referencesId${referenceIdCnt++}`,
    browseName: "string",
    direction: "Forward",
    displayName: 'string',
    target: createNodeHelper()
  };
};

const createReference = (references) => {
  return {

    browseName: references.browseName,
    direction: references.direction,
    displayName: references.displayName
    //target: createNodeHelper()
  };
};

/**
 * Contains methods for calling the device simulation microservice
 */
export class OpcTwinService {

  /**
   * Returns a list of devicemodels
   */
  static getApplicationsList() {
    return HttpClient.get(`${ENDPOINT_REGISTRY}Applications`, undefined, false)
      .map(getItems);
  }

  static getApplication(id) {
    return HttpClient.get(`${ENDPOINT_REGISTRY}Applications/${id}`, undefined, false);
  }

  static browseNode(endpointId, nodeId) {
    const queryString = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : '';
    return HttpClient.get(`${ENDPOINT_OPC_TWIN}Browse/${endpointId}${queryString}`, undefined, false)
      // Temp: only for making fake data
       .map(({ node, references }) => ({
        node,
        references
      }))

      /*.map(({ node, references }) => ({
        node,
        references: [ ...references, createReferenceHelper() ]
      }));*/
  }

  static browseNodeNext(continuationToken = '') {
    //  return HttpClient.get(`${ENDPOINT_OPC_TWIN}Browse/${id}/next`, undefined, false)
    //    .map(response => response.node);
    const response =  {
      references: [
        createNodeHelper()
      ],
      continuationToken: makeid(),
      diagnostics: {}
    }// Past response;
    return Observable.of(response)
      .delay(Math.random() * 4000);
  }
}
