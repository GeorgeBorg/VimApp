'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
	AppRegistry,
	StyleSheet,
	AsyncStorage,
	Text,
	View,
	TouchableHighlight,
	AlertIOS,
  	TextInput,
  	TouchableOpacity,
  	Image,
  	ScrollView,
  	Dimensions,
} from 'react-native';

const FBSDK = require('react-native-fbsdk');

const {
	LoginButton,
	GraphRequest,
	GraphRequestManager,
	LoginManager,
	AccessToken,
} = FBSDK;

const window = Dimensions.get('window');

var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

var Modal   = require('react-native-modalbox');
var Button  = require('react-native-button');

var t = require('tcomb-form-native');
var Form = t.form.Form;

var Event = t.struct({
  title: t.String,              
  description: t.maybe(t.String),
  howLongWillItLast: t.Number,    
});

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Main Page
------------------------------------------------------------------------------------------------------------------------------------------------------ */

var MapPage = React.createClass({

  	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
  	   Initializers
  	------------------------------------------------------------------------------------------------------------------------------------------------------ */

	mixins: [Mapbox.Mixin],

  	watchID: (null: ?number),



  	componentDidMount: function() {

		navigator.geolocation.getCurrentPosition(
			(position) => {
			        	var initialPosition = position;
			        	
			        	this.setState({
			        		center: {
			          			latitude: position.coords.latitude,
			          			longitude: position.coords.longitude
			        		}
				});
				this.onMapLoad(this.state.center);

			},

	      		(error) => alert(error.message),
	      		{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
		);

		this.watchID = navigator.geolocation.watchPosition((position) => {});

	  	 this._loadInitialState().done();


	},

  	async _loadInitialState() {
		try {
			var profile_picture = await AsyncStorage.getItem("facebook_picture").then((value) => {return value});
		} catch (error) {
	      	this._appendMessage('AsyncStorage error: ' + error.message);
	    };

	    this.setState({facebook_picture: profile_picture});
   	 },

  	componentWillUnmount: function() {
  		navigator.geolocation.clearWatch(this.watchID);
  	},

  	getInitialState() {

		return {
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 8,
			animated: true,
	      		isOpen: false,
			swipeToClose: true,
			sliderValue: 0.3,
	      		name: 'initial',
    		}
  	},

  	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
  	   Modal
  	------------------------------------------------------------------------------------------------------------------------------------------------------ */

  	  openForm: function(id) {
	    this.refs.form_modal.open();
	  },

	  closeForm: function(id) {
	    this.refs.form_modal.close();
	  },

 	  openSettings: function(id) {
	    this.refs.settings_modal.open();
	  },

	   closeSettings: function(id) {
	    this.refs.settings_modal.close();
	  },

	  onClose: function() {
	    console.log('Modal just closed');
	  },

	  onOpen: function() {
	    console.log('Modal just opened');
	  },

	  onClosingState: function(state) {
	    console.log('the open/close of the swipeToClose just changed');
	  },

	  saveEvent: function () {
	    // call getValue() to get the values of the form
	    var value = this.refs.form.getValue();
	    if (value) { // if validation fails, value will be null
	   	this._createEvent(value);
	      	
	 	this.refs.form_modal.close();

	    }
	  },

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   Create Event
	------------------------------------------------------------------------------------------------------------------------------------------------------ */
	_createEvent(details) {
		AsyncStorage.getItem("access_token").then((value) => {
			fetch("http://localhost:3000/events", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Token token=' + value
				},
				body: JSON.stringify({
					title: details.title,
					description: details.description,
					latitude: this.state.center.latitude,
					longitude: this.state.center.longitude,
					endtime: details.howLongWillItLast,
				})
			})
			.then((response) => {
				return response.json()
			})
			.then((responseData) => {
				return responseData;
			})
			.then((data) => { 
				var query = urlForQuery(this.state.center);
	  			this._getEvents(query);
			})
			.catch(function(err) {
		  	})
			.done();
		}).done();

	},

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   Map GET and display
	------------------------------------------------------------------------------------------------------------------------------------------------------ */


	onMapLoad(center) {
	  	var query = urlForQuery(center);
	  	this._getEvents(query);
	},

	_getEvents(query) {
		AsyncStorage.getItem("access_token").then((value) => {
			fetch(query,{
				method: "GET",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Token token=' + value
				},
			})
			.then((response) => {
				return response.json()
			})
			.then((responseData) => {
				return responseData;
			})
			.then((data) => { 
			 	var data = data
			 	if (data) {
			   		this._displayEvents(data);
			 	}
			   	else {
			   		alert('nada')
			   	}
			})
			.catch(function(err) {
				console.log(err);
		  	})
			.done();
		}).done();
	},

	_displayEvents(events) {
		var VimEvents = [];
		events.forEach(function(event) {
        		VimEvents.push({
        		"type": "point",
        		"coordinates": [event.latitude, event.longitude],
	        	"title": event.title,
	        	"subtitle": event.description,
	        	'id': event.id.toString(),
		    })
		})

		this.setState({
			annotations:
  				VimEvents
		});

	},


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
	},

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   Render
	------------------------------------------------------------------------------------------------------------------------------------------------------ */
  	render() {

    		return (

	    		<View style={styles.container}>

 				<Mapbox
					style={{flex: 1}}
					direction={0}
					rotateEnabled={true}
					scrollEnabled={true}
					zoomEnabled={true}
					showsUserLocation={true}
					ref={mapRef}
					accessToken={"pk.eyJ1IjoiZ2VvcmdlYm9yZyIsImEiOiJjaWk3bnFqYzEwMDlidm5tMnJyMGVvMTFlIn0.t-lvmWyHHj3EjAypomaztw"}
					styleURL={this.mapStyles.streets}
					userTrackingMode={this.userTrackingMode.follow}
					centerCoordinate={this.state.center}
					zoomLevel={this.state.zoom}
					onRegionChange={this.onRegionChange}
					onRegionWillChange={this.onRegionWillChange}
					annotations={this.state.annotations}
					onOpenAnnotation={this.onOpenAnnotation}
					onRightAnnotationTapped={this.onRightAnnotationTapped}
					onUpdateUserLocation={this.onUpdateUserLocation}
					onLongPress={this.onLongPress}
					onTap={this.onTap} 
				/>

				<Button onPress={this.openSettings}  style={styles.settings_button}>Love Me</Button>

				<Button onPress={this.openForm} style={styles.create_button}>Create Vim</Button>

				<Modal style={[styles.modal]} ref={"form_modal"} swipeToClose={this.state.swipeToClose} onClosed={this.onClose} onOpened={this.onOpen} onClosingState={this.onClosingState} backdropOpacity={0.5}  backdropColor={"white"} >

					<Form
						ref="form"
						type={Event}
					/>
				  	<Button onPress={this.saveEvent} style={styles.button}>Create</Button>
				 	<Button onPress={this.closeForm} style={styles.button}>Cancel</Button>

				</Modal>


				<Modal style={[styles.modal]} ref={"settings_modal"} swipeToClose={this.state.swipeToClose} onClosed={this.onClose} onOpened={this.onOpen} onClosingState={this.onClosingState} backdropOpacity={0.5}  backdropColor={"white"} >

					<Image
						style={styles.facebook_icon}
						source={{uri: this.state.facebook_picture}}
					/>

					<LoginButton
						style={styles.login}
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

				 	<Button onPress={this.closeSettings} style={styles.button}>Cancel</Button>

				</Modal>

			</View>

    		);

  	},

});

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   URL for GET events
------------------------------------------------------------------------------------------------------------------------------------------------------ */

function urlForQuery(center) {
  	var params = {
	      	latitude: center.latitude,
	      	longitude: center.longitude,
  	};
 
	var querystring = Object.keys(params)
	.map(key => key + '=' + encodeURIComponent(params[key]))
	.join('&');

	return 'http://localhost:3000/events?' + querystring;
};


/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Styles
------------------------------------------------------------------------------------------------------------------------------------------------------ */

var styles = StyleSheet.create({

	container: {
		flex: 1,
		justifyContent: 'center',
	},

	modal: {
		justifyContent: 'center',
		alignItems: 'center',
		height:400,
		width:300,
		borderRadius: 5,
	},

	button: {
		backgroundColor: '#3B5998',
		padding: 10,
		color: "white",
		width: 150,
		marginBottom: 10,
		alignSelf: 'stretch',
		justifyContent: 'center'
	},

	create_button: {
		position: 'absolute',
		backgroundColor: "#3B5998",
		color: "white",
		padding: 10,
		bottom: 0,
	},

	settings_button: {
		position: 'absolute',
		backgroundColor: '#3B5998',
		bottom: 0,
		right: 0,
		color: 'white',
		padding:10,
	},

	facebook_icon: {
	    width: 100,
	    height: 100,
		borderRadius: 50,
		marginBottom: 150,
  	},

	login: {
		height: 30,
		marginBottom: 50,
		width: 90,
	},

});

module.exports = MapPage;