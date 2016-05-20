'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';

import {
	StyleSheet,
	Text,
	View,
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

class LoginPage extends Component {

	render() {
		return (

			<View style={{flex: 1,}}>

				<NavigationBar
			      	title={{ title: 'Login', }}
			        leftButton={{ title: 'Back', }}
			        rightButton={{ title: 'Forward', }}
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

									this._loadMapPage();

								}
							}
						}
					/>

				</View>

			</View>

		);
	}

	//Create response callback.
	_responseInfoCallback(error: ?Object, result: ?Object) {
		if (error) {
	    	alert('Error posting data: ' + error.toString());
		} 
		else {
			console.log(result.email);
	    	this.setState({ email: result.email});
	    	// this._executeQuery();
		};
	}

	_createUser(response) {
		fetch("http://localhost:3000/users", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				auth_token: response.accessToken,
				uid: response.userID
			})
		})
		.then((response) => response.json())
		.then((responseData) => {
		});
	}

	_loadMapPage() {
		this.props.navigator.resetTo({
			component: MapPage
		});
	};

}

module.exports = LoginPage;
