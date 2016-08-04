'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';


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
var margin = (window.width)*0.025
var theWidth = (window.width)-margin*2

var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

var Modal   = require('react-native-modalbox');
var Button  = require('react-native-button');

var t = require('tcomb-form-native');
var Form = t.form.Form;

var LoginPage = require('./LoginPage');



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
			        	
			        	this.setState({
			        		center: {
			          			latitude: position.coords.latitude,
			          			longitude: position.coords.longitude
			        		}
				});
				this._onMapLoad(this.state.center);

			},

	      		(error) => alert(error.message),
	      		{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
		);

		this.watchID = navigator.geolocation.watchPosition((position) => {});

	  	this._loadInitialState().done();

	  	this.refs.join_button.fadeOut(1);

	},

  	async _loadInitialState() {
		try {
			var profile_picture = await AsyncStorage.getItem("facebook_picture").then((value) => {return value});
			var user_name = await AsyncStorage.getItem("user_name").then((value) => {return value});

		} catch (error) {
	      	this._appendMessage('AsyncStorage error: ' + error.message);
	    };

	    this.setState({facebook_picture: profile_picture});
	    this.setState({user_name: user_name});
	    this.setState({event_modal: false});
	    this.setState({settings_modal: false});
	    this.setState({create_modal: false});
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
			zoom: 14,
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
		this.setState({create_modal: true});
		this.refs.create_button.bounceOutDown(1000)
	},

	closeForm: function(id) {
		this.refs.form_modal.close();
	},

	onFormClosed: function() {
		this.refs.create_button.bounceInUp(800)
		this.setState({create_modal: false});
	},

	openEvent: function(id) {
	  	this.setState({event_title: id.title});
	  	this.setState({event_description: id.description});

	  	if (this.state.event_modal == false) {
	  		this.refs.create_button.bounceOutDown(500);
			this.refs.join_button.bounceInUp(500);
		}

	  	this.setState({event_modal: true});

	 	this.refs.event_modal.open();

	},

	closeEvent: function(id) {
		this.refs.event_modal.close();
	},

	onEventClosed: function(id) {
		this.setState({event_modal: false});

		if (this.state.settings_modal == false) {
			this.refs.create_button.bounceInUp(500);
			this.refs.join_button.bounceOutDown(500);
		}
	},

  	openSettings: function(id) {
		this.refs.settings_modal.open();
		this.setState({settings_modal: true});

		if (this.state.event_modal == true) {
			this.refs.event_modal.close();
			this.refs.join_button.bounceOutDown(500);
		}
		else {
			this.refs.create_button.bounceOutDown(500);
		}
	},

	closeSettings: function(id) {
		this.refs.settings_modal.close();
	},	

	onSettingsClosed: function() {
		this.refs.create_button.bounceInUp(500);
		this.setState({settings_modal: false});
	},

	saveEvent: function () {
		// call getValue() to get the values of the form
		var value = this.refs.form.getValue();
		if (value) { // if validation fails, value will be null
			this._createEvent(value);

			this.refs.form_modal.close();
		}
	},

	joinEvent: function () {
		// call getValue() to get the values of the form
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
				var query = this._urlForQuery(this.state.center);
	  			this._getEvents(query);
			})
			.catch(function(err) {
		  	})
			.done();
		}).done();

	},

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   GET Events & Display
	------------------------------------------------------------------------------------------------------------------------------------------------------ */

	_urlForQuery(center) {
	  	var params = {
		      	latitude: center.latitude,
		      	longitude: center.longitude,
	  	};
	 
		var querystring = Object.keys(params)
		.map(key => key + '=' + encodeURIComponent(params[key]))
		.join('&');

		return 'http://localhost:3000/events?' + querystring;
	},

	_onMapLoad(center) {
	  	var query = this._urlForQuery(center);
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
	        	'id': event.id.toString(),
		    })
		})

		this.setState({
			annotations:
  				VimEvents
		});

	},

	fetchInfo(event) {
	  	var infoQuery = this._urlForInfoQuery(event);
	  	this._getEventInfo(infoQuery);
	},

	_urlForInfoQuery(event) {
		var id = event.id;
		return 'http://localhost:3000/events/' + id;
	},

	_getEventInfo(infoQuery) {

		AsyncStorage.getItem("access_token").then((value) => {
			fetch(infoQuery,{
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
			   		this.openEvent(data);
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
					onOpenAnnotation={this.fetchInfo}
					onRightAnnotationTapped={this.fetchInfo}
					onUpdateUserLocation={this.onUpdateUserLocation}
					onLongPress={this.onLongPress}
					onTap={this.onTap} 
					attributionButtonIsHidden={false}
				/>

				<TouchableOpacity onPress={this.openSettings} style={{alignItems: 'center'}}>
				
					<Image 
						style={styles.settings_button}
						source={{uri: "http://www.freeiconspng.com/uploads/settings-icon-4.png"}}
					/>

				</TouchableOpacity>

				{/* ------------------------------------------------------------------------------------------------------------------------------------------------------
				   Event Modal
				------------------------------------------------------------------------------------------------------------------------------------------------------ */}

				<Modal style={styles.events_modal} ref={"event_modal"} animationDuration={300} position={"bottom"} swipeToClose={this.state.swipeToClose} onClosed={this.onEventClosed} onOpened={this.onEventOpened} onClosingState={this.onEventClosingState} backdrop={false} >

					<View style={{width: theWidth, backgroundColor: "#F7F7F7"}}>	
						
						<TouchableOpacity onPress={this.closeEvent} style={{alignItems: 'center'}}>
						
							<Image 
								source={{uri: "https://cdn0.iconfinder.com/data/icons/slim-square-icons-basics/100/basics-08-128.png"}}
								style={styles.arrow_icon}
							/>
						
						</TouchableOpacity>

					</View>

					<View style={{marginTop:30}}>

						<Text style={styles.profile_name}>
							{this.state.event_title}
						</Text>

						<Text style={styles.profile_name}>
							{this.state.event_description}
						</Text>

					</View>

				</Modal>

				{/* ------------------------------------------------------------------------------------------------------------------------------------------------------
				   Settings Modal
				------------------------------------------------------------------------------------------------------------------------------------------------------ */}

				<Modal style={styles.settings_modal} ref={"settings_modal"} entry={"top"} swipeToClose={this.state.swipeToClose} onClosed={this.onSettingsClosed} onOpened={this.onSettingsOpened} onClosingState={this.onClosingState} backdropOpacity={0.5}  backdropColor={"white"} >

					<View style={{width:theWidth, backgroundColor: "#F7F7F7"}}>	
					
						<TouchableOpacity onPress={this.closeSettings} style={{alignItems: 'center'}}>
						
							<Image 
								source={{uri: "http://www.icon2s.com/wp-content/uploads/2014/07/collapse-arrow3-300x300.png"}}
								style={styles.arrow_icon}
							/>
						
						</TouchableOpacity>

					</View>

					<Image
						style={styles.facebook_icon}
						source={{uri: this.state.facebook_picture}}
					/>

					<Text style={styles.profile_name}>
						{this.state.user_name}
					</Text>

					<LoginButton
						style={styles.login}
						readPermissions={["public_profile", "email", "user_friends"]}
						onLogoutFinished={ () =>
							this.props.navigator.replace({
								component: require('./LoginPage')
							})
						}
					/>

				</Modal>

				
				<Animatable.View ref="join_button" delay={10000} >
					<Button style={styles.main_button}>Crash</Button>
				</Animatable.View>

				<Animatable.View ref="create_button">
					<Button onPress={this.openForm} style={styles.main_button}>Create</Button>
				</Animatable.View>

				{/* ------------------------------------------------------------------------------------------------------------------------------------------------------
				   Form Modal
				------------------------------------------------------------------------------------------------------------------------------------------------------ */}

				<Modal style={styles.form_modal} ref={"form_modal"} swipeToClose={this.state.swipeToClose} onClosed={this.onFormClosed} onOpened={this.onOpen} onClosingState={this.onClosingState} backdropOpacity={0.5}  backdropColor={"white"} >
					
					<View style={{width: theWidth, backgroundColor: "#F7F7F7"}}>	
						
						<TouchableOpacity onPress={this.closeForm} style={{alignItems: 'center'}}>
						
							<Image 
								source={{uri: "https://cdn0.iconfinder.com/data/icons/slim-square-icons-basics/100/basics-08-128.png"}}
								style={styles.arrow_icon}
							/>
						
						</TouchableOpacity>

					</View>

					<View style={{marginTop:30}}>

						<Form
							ref="form"
							type={Event}
						/>

					</View>

					<TouchableOpacity onPress={this.saveEvent} style={{alignItems: 'center'}}>
						
						<Image 
							source={{uri: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678134-sign-check-128.png"}}
							style={styles.tick_icon}
						/>
						
					</TouchableOpacity>


				</Modal>

			</View>

		);

  	},

});


/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Styles
------------------------------------------------------------------------------------------------------------------------------------------------------ */

var styles = StyleSheet.create({

	container: {
		flex: 1,
		justifyContent: 'center',

	},

	form_modal: {
		alignItems: 'center',
		height:400,
		width:theWidth,
		borderRadius: 2,
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.3,
	},

	events_modal: {
		alignItems: 'center',
		height:200,
		width:theWidth,
		bottom: 45 + 2*margin,
		borderRadius: 2,
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.3,
	},

	settings_modal: {
		alignItems: 'center',
		height:400,
		width: theWidth,
		borderRadius: 2,
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.3,
	},

	button: {
		backgroundColor: '#1ECE6D',
		padding: 10,
		color: "white",
		marginTop:20,
		width: 170,
		letterSpacing: 1,
		fontSize: 14,
		justifyContent: 'center'
	},

	main_button: {
		position: 'absolute',
		backgroundColor: "rgba(255,115,113,0.95)",
		color: "white",
		textAlign: "center",
		padding: 15,
		margin: margin,
		bottom: margin,
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.45,
		letterSpacing: 1,
		fontSize: 15,
		fontFamily: 'Helvetica',
		width: theWidth,
	},

	settings_button: {
		position: 'absolute',
		shadowRadius: 2,
		shadowOffset: {width: 1, height: 1},
		shadowColor: 'black',
		shadowOpacity: 0.45,
		bottom: 610,
		left: 10,
		width:30,
		height:30,
	},

	facebook_icon: {
		width: 100,
		height: 100,
		marginTop:40,
		borderRadius: 50,
  	},

  	profile_name: {
  		color: "black",
  		fontSize:18,
  		fontWeight: "600",
  		color: "#333",
  		marginTop:10,
  	},

  	arrow_icon: {
		width: 20,
		height: 20,
  	},

  	tick_icon: {
  		width: 60,
  		height: 60,
  	},

	login: {
		height: 30,
		marginTop:120,
		width:200,
	},

});

module.exports = MapPage;