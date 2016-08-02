'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';

import {
	StyleSheet,
	Text,
	View,
	AsyncStorage,
	TouchableHighlight,
	AlertIOS,
	Image,
} from 'react-native';

const FBSDK = require('react-native-fbsdk');

const {
	LoginButton,
	GraphRequest,
	GraphRequestManager,
	LoginManager,
	AccessToken,
} = FBSDK;

var MapPage = require('./MapPage');

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Main Screen
------------------------------------------------------------------------------------------------------------------------------------------------------ */

class SettingsPage extends Component {

	constructor(props) {

		super(props);

		this.state = {
			facebook_picture: 'loading'
		};

	}

  	componentDidMount() {
	    this._loadInitialState().done();
  	}

  	async _loadInitialState() {
		try {
			var profile_picture = await AsyncStorage.getItem("facebook_picture").then((value) => {return value});
		} catch (error) {
	      	this._appendMessage('AsyncStorage error: ' + error.message);
	    };

	    this.setState({facebook_picture: profile_picture});
    }

	render() {
 
		return (
			<View style={{flex: 1,}}>

				<NavigationBar
					title={{ title: 'Settings', }}
				/>

				<View style={styles.container}>

					<Image
				        style={styles.icon}
				        source={{uri: this.state.facebook_picture}}
				    />

					<LoginButton
						readPermissions={["public_profile", "email", "user_friends"]}
						onLoginFinished={
							(error, result) => {
								if (error) {
									alert("login has error: " + result.error);
								} 
								else if (result.isCancelled) {
								} 
								else {
							    	AccessToken.getCurrentAccessToken().then((response) => {
								        this._createUser(response);
								    }).done();

								}
							}
						}
					/>

				</View>

			</View>

		);
	}

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   Create User Request
	------------------------------------------------------------------------------------------------------------------------------------------------------ */

	_createUser(response) {
		fetch("http://localhost:3000/users", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				facebook_auth_token: response.accessToken,
				facebook_id: response.userID
			})
		})
		.then((response) => {
			return response.json()
		})
		.then((responseData) => {
			return responseData;
		})
		.then((data) => { 
			var access_token = JSON.stringify(data.access_token)
			var facebook_picture = (data.facebook_picture)
			AsyncStorage.setItem("access_token", access_token)
			AsyncStorage.setItem("facebook_picture", facebook_picture)
		})
		.catch(function(err) {
			console.log(err);
	  	})
		.done();

		var MapPage = require('./MapPage');

		this._loadMapPage(MapPage);

	}

	_loadMapPage(MapPage) {
		this.props.navigator.resetTo({
			component: MapPage
		});
	};

}

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Styles
------------------------------------------------------------------------------------------------------------------------------------------------------ */

const styles = StyleSheet.create({

	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
		height: 100,
	},

	button: {
		height: 10,
		backgroundColor: '#48BBEC',
		borderColor: '#48BBEC',
		borderWidth: 1,
		borderRadius: 8,
		marginBottom: 10,
		justifyContent: 'center'
	},

  	buttonText: {
		fontSize: 18,
		color: 'white',
		alignSelf: 'center'
	},

	icon: {
	    width: 15,
	    height: 15,
  	},

});

module.exports = SettingsPage;
