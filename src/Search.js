import React from 'react';
import { FlatList, StyleSheet, Text, View, BackHandler, Dimensions, TextInput, Image, TouchableOpacity, Alert, RefreshControl, AsyncStorage, Keyboard } from 'react-native';
import CustomRow from './CustomRow';
import Icon from 'react-native-vector-icons/Ionicons';
import WifiManager from 'react-native-wifi';
import NavigationDrawer from './Drawer';
import NotificationConfig from './NotificationConfig';
import { Badge } from 'react-native-elements';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nearUsers: [],
      loading: true,
      search: "",
      userPhoto: this.props.navigation.getParam("userPhoto"),
      userName: this.props.navigation.getParam("userName"),
      userId: this.props.navigation.getParam("userId"),
      userPhone: this.props.navigation.getParam("userPhone"),
      session: this.props.navigation.getParam("session"),
      notCount: 0,
    }
    
    console.log("Token: " + this.state.session);

    this.watchId = "";
    this.searchInput = null;
    this.lastUpdate = 0;
    this.drawer = undefined;
  }

  _update(search) {
    if(!this.mounted){
        return;
    }
    
    search = search || "";

    setTimeout(() => this._update(), 10000);

    var now = (new Date).getTime();

    if (search == "" && (now - this.lastUpdate < 3000)) {
      return;
    }

    this.lastUpdate = now;

    this.setState({ loading: true });

    while (this.state.session == undefined || this.state.session == null) {
    }

    if (search.length <= 0) {
      this.watchId = navigator.geolocation.watchPosition(() => {
        this._getLocation();
      });
    }

    let url = 'http://autosavestudio.com/numberin/user/near.php?session=' + this.state.session + "&q=" + search;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        let nearUsers = responseJson;
        if (nearUsers) {
          this.setState({ nearUsers });
        } else {
          this.setState({ nearUsers: [] });
        }
        this.setState({ loading: false });
      }).catch((error) => {
        console.log(error);
        this.setState({ loading: false });
      });
  }

  _search(search) {
    navigator.geolocation.clearWatch(this.watchId);
    this.setState({ search });
    this._update(search);
  }

  _cancelSearch() {
    this._search("");
    this.searchInput.blur();
    Keyboard.dismiss();
  }

  _getLocation() {
    var wireless = '';
    WifiManager.getCurrentWifiSSID()
      .then((ssid) => {
        wireless = ssid;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetch("http://autosavestudio.com/numberin/user/setLocation.php?session=" + this.state.session, {
              method: "POST",
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                wireless: wireless
              })
            }).then(response => {
              this._update();
            }).catch(error => {
              console.log(error);
            });
          },
          error => {
            var url = 'http://autosavestudio.com/numberin/user/wirelessLocation.php?session=' + this.state.session + '&name=' + wireless;
            fetch(url)
              .then((response) => {
                this._update();
              }).catch(error => {
                console.log(error);
              });
            this.setState({ loading: false });
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 });
      },
        error => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetch("http://autosavestudio.com/numberin/user/setLocation.php?session=" + this.state.session, {
                method: "POST",
                body: JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                })
              }).then(response => {
                this._update();
              }).catch(error => {
                this.setState({ loading: false });
              });
            },
            error => {
              console.log(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 });
        });
  }

  _setDrawer(nav) {
    this.drawer = nav;
  }

  _backPressed = () => {
    if (this.drawer.isOpen()) {
      this.drawer.close();
    } else {
      Alert.alert(
        'Sair do Numberin',
        'Tem certeza que deseja sair?',
        [
          { text: 'Sim', onPress: () => BackHandler.exitApp() },
          { text: 'Não', style: 'cancel' },
        ],
        { cancelable: false });
    }
    // this.props.navigation.dismissAllModals();
    return true;
  }

  componentDidMount() {
    this.mounted = true;
    BackHandler.addEventListener('hardwareBackPress', this._backPressed);

    if (this.props.navigation.getParam("openEditUser")) {
      this.props.navigation.navigate('EditUser');
    }

    this._getLocation();
    this._getNotCount();
  }

  async _getNotCount() {
    if(!this.mounted){
        return;
    }

    var count = await AsyncStorage.getItem("NotificationCount");

    this.setState({ notCount: count });

    setTimeout(() => this._getNotCount(), 2000);
  }

  componentWillUnmount() {
    this.mounted = false;
    navigator.geolocation.clearWatch(this.watchId);
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.drawerToggler} onPress={() => this.drawer.open()}>
            <Icon name={'md-menu'} color={'black'} size={30} />
            {(this.state.notCount > 0) &&
              <Badge value={this.state.notCount} status={'error'} containerStyle={styles.notificationCount} />
            }
          </TouchableOpacity>

          <TextInput
            onChangeText={(search) => this._search(search)}
            value={this.state.search}
            style={styles.searchInput}
            placeholderTextColor="gray"
            placeholder="Numberin"
            ref={input => this.searchInput = input}
          />

          <Icon name={'ios-search'} color={'gray'} size={25} style={styles.searchIcon} />

          {this.state.search != "" &&
            <TouchableOpacity onPress={() => this._cancelSearch()} style={[styles.searchIcon, {
              backgroundColor: 'white',
              zIndex: 10,
              right: 20,
              top: 15,
              borderRadius: 50,
              padding: 5,
            }]}>
              <Icon name={'md-close'} color={'gray'} size={25} />
            </TouchableOpacity>
          }
        </View>

        {this.state.nearUsers.length > 0 &&
          <FlatList
            data={this.state.nearUsers}
            style={{ width: WIDTH }}
            renderItem={({ item }) =>
              <CustomRow
                id={item.id}
                name={item.name}
                phone={item.phone}
                picture={item.picture}
                lasttime={item.lasttime}
                onClick={() => this.props.navigation.navigate('UserView', {
                  id: item.id,
                  onGoBack: () => BackHandler.addEventListener('hardwareBackPress', this._backPressed)
                })}
              />
            }
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={() => this._update()}
              />
            }
            ItemSeparatorComponent={() => {
              return (
                <View style={{
                  height: 1,
                  backgroundColor: '#ccc',
                  width: '95%',
                  alignSelf: 'center',
                }} />
              )
            }}>
          </FlatList>
        }

        {this.state.nearUsers.length <= 0 &&
          <View style={{
            width: WIDTH,
            alignItems: 'center'
          }}>
            <Text style={{
              color: 'black',
              fontSize: 15,
              paddingBottom: 20,
              paddingTop: 20,
            }}>
              Nenhum usuário por perto.
              </Text>
            <TouchableOpacity style={{
              backgroundColor: 'rgb(61,133,198)',
              borderRadius: 100,
              width: WIDTH - 50,
              padding: 10,
              alignItems: 'center',
            }}
              onPress={() => this._update()}
            >
              <Text style={{
                fontSize: 15,
                color: 'white'
              }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        }

        <NavigationDrawer
          navigation={this.props.navigation}
          name={this.state.userName}
          number={this.state.userPhone}
          picture={{ uri: this.state.userPhoto ? this.state.userPhoto : "http://autosavestudio.com/numberin/user.png" }}
          ref={nav => this._setDrawer(nav)}
          backPressed={() => this._backPressed()}
          session={this.state.session}
          atual={"Search"}
        />

        <NotificationConfig />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'stretch',
    backgroundColor: 'white'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  },
  header: {
    height: 65,
    position: 'relative',
    width: WIDTH,
    backgroundColor: 'rgb(61,133,198)',
  },
  drawerToggler: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 65,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3
  },
  searchInput: {
    color: 'black',
    borderRadius: 100,
    backgroundColor: 'white',
    fontSize: 18,
    paddingLeft: 45,
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
  },
  searchIcon: {
    position: 'absolute',
    right: 25,
    top: 20,
    zIndex: 3
  },
  container: {
    flex: 1,
  },
  notificationCount: {
    position: 'absolute',
    left: 35,
    top: 15,
  },
});
