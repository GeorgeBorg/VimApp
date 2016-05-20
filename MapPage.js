'use strict';

import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
const SideMenu = require('react-native-side-menu');

import {
	AppRegistry,
	StyleSheet,
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


var Button = React.createClass({

  	getInitialState() {
		return {
			active: false,
		};
  	},

  	_onHighlight() {
    		this.setState({active: true});
  	},

  	_onUnhighlight() {
    		this.setState({active: false});
  	},

  	render() {

	    	var colorStyle = {
	      		color: this.state.active ? '#fff' : '#000',
	    	};

	    	return (
				<TouchableHighlight
					onHideUnderlay={this._onUnhighlight}
					onPress={this.props.onPress}
					onShowUnderlay={this._onHighlight}
					style={[styles.button, this.props.style]}
					underlayColor="white"
				>

      				<Text style={[styles.buttonText, colorStyle]}>{this.props.children}</Text>

	      		</TouchableHighlight>
	    	);
  	}
});

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
				auth_token: response.accessToken,
				uid: response.userID
			})
		})
		.then((response) => response.json())
		.then((responseData) => {
		});
	}

  	render() {

    	return (

				<ScrollView scrollsToTop={false} style={styles.menu}>

			        <LoginButton
			        	onLogoutFinished={() => this.props.onItemSelected('Logout')}
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
								    }).done()

								}
							},

							() => {this.props.onItemSelected('Logout')}
						}
					/>

      			</ScrollView>

    	);

  	}

}

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

function urlForQueryAndPage(key, value) {

  	var data = {
      	lat: "52.0",
      	long: "4.8",
      	encoding: 'json',
  	};

  	data[key] = value;
 
	var querystring = Object.keys(data)
	    .map(key => key + '=' + encodeURIComponent(data[key]))
	    .join('&');

	var get = 'http://localhost:3000/events?' + querystring;
	alert(get)
	return 'http://localhost:3000/events?' + querystring;
};

var MapPage = React.createClass({

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
			zoom: 14,
			animated: true,
			modalVisible: false,
			transparent: false,
      		isOpen: false,
    	}
  	},

  	_setModalVisible(visible) {
		this.setState({modalVisible: visible});
  	},

  	_toggleAnimated() {
		this.setState({animated: !this.state.animated});
  	},

	_toggleTransparent() {
		this.setState({transparent: !this.state.transparent});
	},

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

	_getEvents(query) {
		fetch(query)
		  .then(response => response.json())
		  .then(json => this._handleResponse(json.response))
		  .catch(error =>
		     this.setState({
		      isLoading: false,
		      message: 'Something bad happened ' + error
		   }));
	},

	_handleResponse(response) {
		alert(response)
	  	this.setState({ isLoading: false , message: '' });
	  	if (response.application_response_code.substr(0, 1) === '1') {
	    	console.log('Properties found: ' + response.listings.length);
	  	} else {
	    	this.setState({ message: 'Location not recognized; please try again.'});
	  	}
	},

	onSearchPressed() {
	  	var query = urlForQueryAndPage('place_name', '1');
	  	this._getEvents(query);
	},

  	render() {

		var modalBackgroundStyle = { backgroundColor: this.state.transparent ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff', marginTop: 10,};

		var innerContainerTransparentStyle = this.state.transparent ? {backgroundColor: '#fff', padding: 20} : null;

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
				        	handler: () => this.onSearchPressed()
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
							styleURL={this.mapStyles.basic}
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

						<Modal
							animated={this.state.animated}
							transparent={this.state.transparent}
							visible={this.state.modalVisible}
							onRequestClose={() => {this._setModalVisible(false)}}
							style={styles.modal}
						>

						  	<View style={[styles.container, modalBackgroundStyle]}>

						    	<View style={[styles.innerContainer, innerContainerTransparentStyle]}>

						      		<TextInput
							            style={styles.textinput}
							            onChangeText={(title) => this.setState({title})}
							            value={this.state.title} 
							            placeholder={'Title'}
						          	/>

						            <TextInput
							            style={styles.textinput}
							            onChangeText={(description) => this.setState({description})}
							            value={this.state.description} 
							            placeholder={'Description'}
						            />

						      		<TextInput
							            style={[styles.textinput, styles.invites]}
							            onChangeText={(invites) => this.setState({invites})}
							            value={this.state.invites} 
							            placeholder={'Invite'}
						      		/> 

						      		<Button>
					        			Create!
						      		</Button>

						      		<Button
							            onPress={this._setModalVisible.bind(this, false)}
							            style={styles.modalButton}
									>

					            		Cancel

						      		</Button>  
						                  
						    	</View>

						  	</View>

						</Modal>

					</View>

				</View>

			</SideMenu>
    	);

  	},

});

var styles = StyleSheet.create({
	
	container: {
		flex: 1,
	},

	innerContainer: {
		borderRadius: 10,
		alignItems: 'center',
	},

	modalButton: {
		marginTop: 10,
	},

	modal: {
		marginTop: 10,
	},

	button: {
		borderRadius: 5,
		flex: 1,
		height: 44,
		alignSelf: 'stretch',
		justifyContent: 'center',
		overflow: 'hidden',
		backgroundColor: 'blue',
		margin: 10,
		padding: 10,
	},

	buttonText: {
		fontSize: 18,
		margin: 5,
		textAlign: 'center',
	},

	textinput: {
		margin: 10,
		height: 40, 
		borderColor: 'gray', 
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
	},

	invites: {
		height: 200,
	},

  	menu: {
	    flex: 1,
	    width: window.width,
	    height: window.height,
	    backgroundColor: 'gray',
	    padding: 20,
  	},

  	item: {
	    fontSize: 14,
	    fontWeight: '300',
	    paddingTop: 5,
  	},

});

module.exports = MapPage;