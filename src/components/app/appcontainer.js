// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { AuthService } from 'services';
import App from './app';

import { 
  epics,
  getUser
} from 'store/reducers/appReducer';

const mapStateToProps = state => ({
  user: getUser(state)
});

const mapDispatchToProps = dispatch => {
  window.savedDispatch = dispatch;
  window.savedEpics = epics;
  return {
    logout: () => AuthService.logout(),
    fetchUser: (user) => dispatch(epics.actions.fetchUser(user)),
  };
}


const AppContainer = withRouter(translate()(connect(mapStateToProps, mapDispatchToProps)(App)))

export default AppContainer;
