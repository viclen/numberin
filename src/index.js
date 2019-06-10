import Login from './Login';
import Search from './Search';
import UserView from './UserView';
import Register from './Register';
import EditUser from './EditUser';
import Notifications from './Notifications';

import { createStackNavigator } from 'react-navigation';

const StackNavigator = createStackNavigator(
  {
    Login: Login,
    Search: Search,
    UserView: UserView,
    Register: Register,
    Notifications: Notifications,
    EditUser: EditUser
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
    navigationOptions: {
        headerVisible: false,
    }
  }
);

export default { StackNavigator };
