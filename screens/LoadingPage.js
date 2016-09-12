'use strict';

import React, { Component } from 'react';

import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	AlertIOS,
} from 'react-native';

const styles = StyleSheet.create({

	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	
});

class LoadingPage extends Component {

	render() {

		return (

			<View style={styles.container}>


			</View>
		);

	}

}

module.exports = LoadingPage;
