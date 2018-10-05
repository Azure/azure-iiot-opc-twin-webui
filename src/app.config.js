// Copyright (c) Microsoft. All rights reserved.

const baseUrl = process.env.REACT_APP_BASE_SERVICE_URL || '';

const Config = {
  serviceUrls: {
    registry: process.env.PCS_TWIN_REGISTRY_URL || `${baseUrl}/registry`,
    twins: process.env.PCS_TWIN_SERVICE_URL || `${baseUrl}/twins`
  },
  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  defaultAjaxTimeout: 60000  // 10s
};

export default Config;
