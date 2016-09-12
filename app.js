import React, {Component} from 'react';
import {
  AppRegistry,
  View,
  AsyncStorage
} from 'react-native';

import {Navigation} from 'react-native-navigation';

const FBSDK = require('react-native-fbsdk');

const {
  AccessToken,
} = FBSDK;

// screen related book keeping
import {registerScreens} from './screens';
registerScreens();

AccessToken.getCurrentAccessToken().then((response) => {
	if (response != null) {
		Navigation.startSingleScreenApp({
		  screen: {
		    screen: "VimApp.MapPage",
		    navigatorStyle: {
		    	navBarTextColor: '#fff',
			  	navBarBackgroundColor: '#074E64',
			  	navBarButtonColor: '#fff',
		      	statusBarTextColorScheme: 'light'
		    },
		    title: "Crowd",
		  }
		});
	}
	else {
		Navigation.startSingleScreenApp({
		  screen: {
		    screen: "VimApp.LoginPage",
		    navigatorStyle: {
		    	navBarHidden: true,
		      	statusBarTextColorScheme: 'light'
		    }
		  }
		});
	}
}).done();

