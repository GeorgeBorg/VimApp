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

				<View style={styles.container}>

					<LoginButton
						style={styles.button}
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
			var user_name = (data.name)
			AsyncStorage.setItem("access_token", access_token)
			AsyncStorage.setItem("facebook_picture", facebook_picture)
			AsyncStorage.setItem("user_name", user_name)
		})
		.catch(function(err) {
			console.log(err);
	  	})
		.done();

		this._loadMapPage();

	}

	_loadMapPage() {
		this.props.navigator.replace({
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
		position: 'absolute',
		backgroundColor: "rgba(255,115,113,0.95)",
		padding: 15,
		margin: 10,
		bottom: 12,
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.45,
		width: 355,
	},

  	buttonText: {
		fontSize: 18,
		color: 'white',
		alignSelf: 'center'
	},

});

module.exports = LoginPage;
