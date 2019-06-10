import { AppRegistry } from "react-native";
import { createAppContainer } from "react-navigation";

import Navigator from "./src";
import { name as appName } from "./app.json";
// import bgMessaging from './src/bgMessaging';

const App = createAppContainer(Navigator.StackNavigator);

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerComponent('ReactNativeFirebaseDemo', () => bootstrap);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);