// Copyright (c) Microsoft. All rights reserved.
const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL || 'http://localhost';

const Config = {
  serviceUrls: {
    registry: `${baseUrl}:9042/v1/`,
    opcTwin: `${baseUrl}:9041/v1/`
  },
  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  defaultAjaxTimeout: 60000, // 10s

  aadTenant: process.env.REACT_APP_AAD_TENANT,
  aadAppId: process.env.REACT_APP_AAD_APP_ID,
  aadInstance: process.env.REACT_APP_AAD_INSTANCE
};

export default Config;
