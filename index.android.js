'use strict';

import React, { Component } from 'react';

import NavigationBar from 'react-native-navbar';

var LoginPage = require('./LoginPage');
var MapPage = require('./MapPage');
var LoadingPage = require('./LoadingPage');

  
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  AlertIOS,
  Navigator,
} from 'react-native';

function renderScene(route, navigator) {
    return <route.component route={route} navigator={navigator} />;
}

const FBSDK = require('react-native-fbsdk');

const {
  AccessToken,
} = FBSDK;

class VimApp extends Component {

  constructor(props) {

    super(props);

    this.state = {
      loggedIn: 'loading'
    };

  }

  render() {

    if (this.state.loggedIn == 'loading') {

        return ( 
      <Navigator
                initialRoute={{ component: LoadingPage}}
                renderScene={renderScene}
                key="first"
      />
        )

      }
      else if (this.state.loggedIn == false) {

        return (
      <Navigator
                initialRoute={{ component: LoginPage}}
                renderScene={renderScene}
                key="second"
      />
        )

      } 
      else {

        return (
      <Navigator
                initialRoute={{ component: MapPage}}
                renderScene={renderScene}
                key="third"
      />
        )

      }
    
  }

  componentWillMount() {

    AccessToken.getCurrentAccessToken().then((response) => {
      if (response != null) {
            this.setState({loggedIn: true})
      }
      else {
            this.setState({loggedIn: false})
          }
      }).done();

    }

}


AppRegistry.registerComponent('VimApp', () => VimApp);

module.exports = VimApp;