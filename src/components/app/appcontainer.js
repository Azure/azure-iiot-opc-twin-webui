// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { AuthService } from 'services';
import App from './app';

const mapDispatchToProps = dispatch => ({
  logout: () => AuthService.logout()
});


const AppContainer = withRouter(translate()(connect(undefined, mapDispatchToProps)(App)))

export default AppContainer;
