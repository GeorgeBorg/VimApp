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

class LoginPage extends Component {

	render() {
		return (

			<View style={{flex: 1,}}>

				<NavigationBar
					title={{ title: 'Login', }}
				/>

				<View style={styles.container}>

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
		fetch("http://4c3eff75.eu.ngrok.io/users", {
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
			var facebook_picture = (data.facebook_picture)
			var access_token = JSON.stringify(data.access_token)
			var facebook_picture = (data.facebook_picture)
			AsyncStorage.setItem("access_token", access_token)
			AsyncStorage.setItem("facebook_picture", facebook_picture)
		})
		.catch(function(err) {
			console.log(err);
	  	})
		.done();

		this._loadMapPage();

	}

	_loadMapPage() {
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

});

module.exports = LoginPage;
