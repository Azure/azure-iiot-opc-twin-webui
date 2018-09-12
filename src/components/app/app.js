// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

// App Components
import Header from './header';
import Navigation from './navigation';
import Main from './main';
import PageContent from './pageContent';

// Page Components
import  {
  StartContainer as StartPage,
  PageNotFound
} from 'components/pages';

import './app.css';

/** The base component for the app */
class App extends Component {
  render() {
    return (
      <div className="app">
        <Navigation />
        <Main>
          <Header logout={this.props.logout} t={this.props.t} />
          <PageContent>
            <Switch>
              <Redirect exact from="/" to="/start" />
              <Route exact path="/start" component={StartPage} />
              <Route component={PageNotFound} />
            </Switch>
          </PageContent>
        </Main>
      </div>
    );
  }

}

export default App;
