import { Navigation } from 'react-native-navigation';

import MapPage from './MapPage';
import LoginPage from './LoginPage';
import Messenger from './Messenger';

// register all screens of the app (including internal ones)
export function registerScreens() {
  	Navigation.registerComponent('VimApp.MapPage', () => MapPage);
	Navigation.registerComponent('VimApp.LoginPage', () => LoginPage);
	Navigation.registerComponent('VimApp.Messenger', () => Messenger);
}