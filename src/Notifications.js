import React from 'react';
import { FlatList, StyleSheet, Text, View, BackHandler, Dimensions, Image, TouchableOpacity, RefreshControl, AsyncStorage, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import NavigationDrawer from './Drawer';
import ShortcutBadge from 'react-native-shortcut-badge';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notifications: [],
      loading: false,
      session: undefined,
    }
    this.drawer = undefined;
    this.lastUpdate = 0;
    this.pause = false;
  }

  _update(forced) {
    if (this.pause) {
      return;
    }

    if (this.state.session == undefined || this.state.session == null || this.state.session == "") {
      setTimeout(() => this._update(), 1000);
      return;
    }
    
    var now = (new Date).getTime();

    forced = forced || false;
    if (!forced) {
      setTimeout(() => {
        this._update();
      }, 10000);
      setTimeout(() => {
        fetch("http://autosavestudio.com/numberin/user/getNotifications.php?read=1&session=" + this.state.session);
        ShortcutBadge.setCount(0);
      },5000);
      
      if (now < this.lastUpdate + 3000) {
        return;
      }
    } else {
      fetch("http://autosavestudio.com/numberin/user/getNotifications.php?read=1&session=" + this.state.session);
      ShortcutBadge.setCount(0);
    }

    this.lastUpdate = now;

    this.setState({ loading: true });

    let url = "http://autosavestudio.com/numberin/user/getNotifications.php?session=" + this.state.session;

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        let notifications = response;
        if (notifications) {
          this.setState({ notifications });
        } else {
          this.setState({ notifications: [] });
        }
        this.setState({ loading: false });
      }).catch((e) => {
        this.setState({ loading: false });
      });
  }

  _setDrawer(nav) {
    this.drawer = nav;
  }

  _backPressed = () => {
    if (this.drawer.isOpen()) {
      this.drawer.close();
    } else {
      this.props.navigation.goBack()
    }
    return true;
  }

  _permitir(id_from) {
    fetch("http://autosavestudio.com/numberin/user/allowPermission.php?id=" + id_from + "&session=" + this.state.session)
      .then((response) => {
        ToastAndroid.show("Permissão concedida.", ToastAndroid.LONG);
        this._update();
      })
      .catch((error) => {
      });
  }

  _negar(id_from) {
    fetch("http://autosavestudio.com/numberin/user/rejectPermission.php?id=" + id_from + "&session=" + this.state.session)
      .then(() => {
        ToastAndroid.show("Permissão negada.", ToastAndroid.LONG);
        this._update(true);
      })
      .catch((error) => {

      });
  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._backPressed);
    var session = await AsyncStorage.getItem("session");
    this.setState({ session });
    this.pause = false;
    this._update();
  }

  componentWillUnmount() {
    this.pause = true;
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.drawerToggler} onPress={() => this.drawer.open()}>
            <Icon name={'md-menu'} color={'white'} size={30} />
          </TouchableOpacity>

          <Text style={{ alignSelf: 'center', color: 'white', fontSize: 25, paddingTop: 8 }}>
            Notificações
          </Text>
        </View>

        <FlatList
          data={this.state.notifications}
          style={{ width: WIDTH }}
          renderItem={({ item }) =>
            (
              <View style={{ backgroundColor: item.seen == 1 ? '#e0e0e0' : 'white' }}>
                <View style={styles.notificationItem}>
                  <Icon name={(item.type == 'asked') ? 'ios-contact' : 'md-checkmark-circle-outline'} style={styles.notificationIcon} />
                  <View style={{ flexDirection: 'column', padding: 10, width: WIDTH - 55, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: item.seen == 1 ? 'normal' : 'bold' }}>
                      {(item.type == 'asked') ?
                        `${item.name} pediu para ver seus dados.`
                        :
                        `${item.name} compartilhou dados com você.`
                      }
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ fontSize: 12, color: 'gray', flex: 1 }}>
                        {item.formattedDate}
                      </Text>
                      {(item.type == 'asked' && item.rejected == 1) &&
                        <Text style={{ color: '#dc3545', textAlign: "right", fontSize: 12, flex: 1 }}>
                          Permissão negada.
                      </Text>
                      }
                    </View>
                  </View>
                </View>
                {(item.type == 'asked' && item.rejected == 0) &&
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.btnAccept} onPress={() => this._permitir(item.id_from)}>
                      <Icon name={'md-checkmark'} style={styles.btnFont} />
                      <Text style={styles.btnFont}>Permitir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnReject} onPress={() => this._negar(item.id_from)}>
                      <Icon name={'md-close'} style={styles.btnFont} />
                      <Text style={styles.btnFont}>Negar</Text>
                    </TouchableOpacity>
                  </View>
                }
              </View>
            )
          }
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={() => this._update(true)}
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

        <NavigationDrawer
          navigation={this.props.navigation}
          ref={nav => this._setDrawer(nav)}
          backPressed={() => this._backPressed()}
          session={this.state.session}
          atual="Notifications"
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'stretch',
    backgroundColor: '#e0e0e0'
  },
  header: {
    height: 50,
    position: 'relative',
    width: WIDTH,
    backgroundColor: 'rgb(61,133,198)',
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 1,
  },
  drawerToggler: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 50,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  container: {
    flex: 1,
  },
  notificationItem: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 50,
    color: 'rgb(61,133,198)',
    alignSelf: 'center',
  },
  btnAccept: {
    backgroundColor: '#28a745',
    borderRadius: 50,
    flex: 1,
    margin: 10,
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  btnReject: {
    backgroundColor: '#dc3545',
    borderRadius: 50,
    flex: 1,
    margin: 10,
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  btnFont: {
    color: 'white',
    fontSize: 16,
    paddingRight: 5,
    justifyContent: 'center',
    height: '100%',
    lineHeight: 18,
  }
});
