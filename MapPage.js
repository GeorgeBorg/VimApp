'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
const SideMenu = require('react-native-side-menu');

import {
	AppRegistry,
	StyleSheet,
	AsyncStorage,
	Text,
	View,
	TouchableHighlight,
	AlertIOS,
	Modal,
  	TextInput,
  	TouchableOpacity,
  	Image,
  	ScrollView,
  	Dimensions,
} from 'react-native';

const window = Dimensions.get('window');

var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

const FBSDK = require('react-native-fbsdk');

const {
	LoginButton,
	GraphRequest,
	GraphRequestManager,
	LoginManager,
	AccessToken,
} = FBSDK;

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
			zoom: 13,
			animated: true,
      		isOpen: false,
      		name: 'initial',
    	}
  	},

  	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
  	   Side Menu Functions
  	------------------------------------------------------------------------------------------------------------------------------------------------------ */

  	toggle() {
	    this.setState({
	      	isOpen: !this.state.isOpen,
	    });
  	},

  	updateMenuState(isOpen) {
	    this.setState({ isOpen, });
  	},

	onMenuItemSelected(item) {
	    this.setState({
	      	isOpen: false,
	      	selectedItem: item,
	    })
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
	        	'id': event.title,
		    })
		})

		this.setState({
    		annotations:
      			VimEvents
		});

	},

	/* ------------------------------------------------------------------------------------------------------------------------------------------------------
	   Render
	------------------------------------------------------------------------------------------------------------------------------------------------------ */

  	render() {

		const menu = <Menu onItemSelected={this.onMenuItemSelected}/> 

    	return (
		      	<SideMenu
			        menu={menu}
			        isOpen={this.state.isOpen}
			        onChange={(isOpen) => this.updateMenuState(isOpen)}
		        >

	    		<View style={{flex: 1,}}>

					<NavigationBar
				      	title={{ title: 'Map', }}
				        leftButton={
				        	<SettingsIcon
				              	style={{ 
				              		marginLeft: 8,
				              		marginTop: 8,
				              	}}
				             	onPress={() => this.toggle()}
				            />
				        }
				        rightButton={{ 
				        	title: 'Create',
				        }}
				    />
				
		        	<View style={styles.container}>

		 				<Mapbox
							style={styles.container}
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

					</View>

				</View>

			</SideMenu>
    	);

  	},

});

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Menu
------------------------------------------------------------------------------------------------------------------------------------------------------ */

class Menu extends Component {

  	static propTypes = {
	    onItemSelected: React.PropTypes.func.isRequired,
  	};


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
			AsyncStorage.setItem("access_token", access_token)
		})
		.catch(function(err) {
		    console.log(err);
	  	})
		.done();

		this.props.onItemSelected('Logout')
	}

  	render() {

    	return (

				<ScrollView scrollsToTop={false} style={styles.menu}>

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
			        	onLogoutFinished={() => this.props.onItemSelected('Logout')}

					/>

      			</ScrollView>

    	);

  	}

}

/* ------------------------------------------------------------------------------------------------------------------------------------------------------
   Settings Icon
------------------------------------------------------------------------------------------------------------------------------------------------------ */


class SettingsIcon extends Component {
  	
  	constructor(props) {

		super(props);

		this.state = {
			active: false
		};

	}

 	handlePress(e) {
	    	if (this.props.onPress) {
	      		this.props.onPress(e)
	    	}
  	}

	_onHighlight() {
		this.setState({active: true});
  	}

  	_onUnhighlight() {
		this.setState({active: false});
  	}

  	render() {
	    	return (
		      	<TouchableOpacity
			onHideUnderlay={this._onUnhighlight}
			onShowUnderlay={this._onHighlight}
			onPress={this.handlePress.bind(this)}
			style={this.props.style}
			underlayColor="white"
		       	>

	       			<Icon name="cog" size={30} color="black" />

	      		</TouchableOpacity>
	    	)
  	}
}

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
	},

	innerContainer: {
		borderRadius: 10,
		alignItems: 'center',
	},

  	menu: {
	    flex: 1,
	    width: window.width,
	    height: window.height,
	    backgroundColor: 'white',
	    padding: 20,
  	},

  	item: {
	    fontSize: 14,
	    fontWeight: '300',
	    paddingTop: 5,
  	},

});

module.exports = MapPage;