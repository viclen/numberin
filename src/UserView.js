import React from 'react';
import { StyleSheet, Text, View, ImageBackground, ActivityIndicator, BackHandler, Dimensions, AsyncStorage, TouchableOpacity, ScrollView, RefreshControl, StatusBar, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FloatingActionMenu from './FloatingActionMenu';

const { width: WIDTH } = Dimensions.get('window');

export default class UserView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.navigation.getParam('id'),
      loading: true,
      name: '',
      email: '',
      about: '',
      picture: '',
      phone: '',
      session: '',
      age: '',
      passouImagem: false,
      lasttime: '',
      gender: ''
    }
    this.floatingMenu = null;
  }

  _getSession = async () => {
    const session = await AsyncStorage.getItem('session');
    this.setState({ session });

    fetch('http://autosavestudio.com/numberin/user/?session=' + this.state.session + '&id=' + this.state.id)
      .then(response => response.json())
      .then((response) => {
        picture = response.picture;
        if (picture == '') {
          picture = "http://autosavestudio.com/numberin/user.png";
        }
        this.setState({
          loading: false,
          name: response.name,
          email: response.email,
          about: response.about,
          picture: picture,
          phone: response.phone,
          age: response.age,
          lasttime: response.lasttime,
          gender: response.gender == 2 ? 'Feminino' : 'Masculino',
        });
      });
  }

  _setFloatingMenu(ref) {
    this.floatingMenu = ref;
  }

  askPermission(){
    let url = 'http://autosavestudio.com/numberin/user/askPermission.php?session=' + this.state.session + '&id=' + this.state.id;
    fetch(url)
    .then((response) => {
        ToastAndroid.show("Pedido de permissão enviado.", ToastAndroid.LONG);
    });
  }


  handleBackButton() {
    this.props.navigation.goBack();
    return true;
  }

  componentDidMount() {
    this._getSession();
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.goBack()
      return true;
    });
  }

  render() {
    return (
      <View
        style={styles.backgroundContainer}>

        {this.state.loading &&
          <View style={styles.loading}>
            <ActivityIndicator size='large' color={'white'} />
          </View>
        }

        {!this.state.loading &&
          <ScrollView
            style={styles.container}
            onScroll={(event) => {
              if (event.nativeEvent.contentOffset.y > WIDTH - 50) {
                this.setState({ passouImagem: true });
              } else {
                this.setState({ passouImagem: false });
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={() => this._getSession()}
              />
            }>

            <ImageBackground
              source={{ uri: this.state.picture != '' ? this.state.picture : 'http://autosavestudio.com/numberin/user.png' }}
              style={styles.photo}>
              <View style={{
                position: 'absolute',
                bottom: 25,
                left: 0,
                right: 0,
                flexDirection: 'row',
                paddingHorizontal: 15,
              }}>
                <Icon name={'ios-contact'} size={25} style={{
                  flex: 1,
                  marginTop: 7,
                  color: 'white',
                  textShadowColor: 'black',
                  textShadowRadius: 4
                }} />
                <View style={{ flex: 10 }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 28,
                    textShadowColor: 'black',
                    textShadowRadius: 4
                  }}>{this.state.name}</Text>
                </View>
              </View>
              <Text style={{
                position: 'absolute',
                bottom: 7,
                left: 0,
                right: 0,
                color: 'white',
                textShadowColor: 'black',
                textShadowRadius: 4,
                paddingLeft: 15,
                fontSize: 15
              }}>
                Há {Math.round(this.state.lasttime / 60)} minutos
              </Text>
            </ImageBackground>

            <View style={{
              flex: 1,
              margin: 10
            }}>

              <View style={styles.infoRow}>
                <Icon name={'ios-call'} size={25} style={{ flex: 1, marginTop: 5 }} />
                <View style={{ flex: 10 }}>
                  <Text style={styles.information}>{this.state.phone}</Text>
                  <Text>Telefone</Text>
                </View>

                {this.state.phone == '' &&
                  <TouchableOpacity style={styles.noPermission} onPress={() => this.askPermission()}>
                    <Icon name={'ios-eye'} style={styles.noPermissionText} />
                    <Text style={styles.noPermissionText}>
                      Pedir permissão para ver o telefone
                    </Text>
                  </TouchableOpacity>
                }
              </View>

              <View style={styles.infoRow}>
                <Icon name={'ios-body'} size={25} style={{ flex: 1, marginTop: 5 }} />
                <View style={{ flex: 10 }}>
                  <Text style={styles.information}>{this.state.age}</Text>
                  <Text>Idade</Text>
                </View>

                {this.state.age == '' &&
                  <TouchableOpacity style={styles.noPermission} onPress={() => this.askPermission()}>
                    <Icon name={'ios-eye'} style={styles.noPermissionText} />
                    <Text style={styles.noPermissionText}>
                      Pedir permissão para ver a idade
                    </Text>
                  </TouchableOpacity>
                }
              </View>

              <View style={styles.infoRow}>
                <Icon name={'ios-at'} size={25} style={{ flex: 1, marginTop: 5 }} />
                <View style={{ flex: 10 }}>
                  <Text style={styles.information}>{this.state.email}</Text>
                  <Text>Email</Text>
                </View>

                {this.state.email == '' &&
                  <TouchableOpacity style={styles.noPermission} onPress={() => this.askPermission()}>
                    <Icon name={'ios-eye'} style={styles.noPermissionText} />
                    <Text style={styles.noPermissionText}>
                      Pedir permissão para ver o email
                    </Text>
                  </TouchableOpacity>
                }
              </View>

              <View style={styles.infoRow}>
                <Icon name={'md-transgender'} size={25} style={{ flex: 1, marginTop: 5 }} />
                <View style={{ flex: 10 }}>
                  <Text style={styles.information}>{this.state.gender}</Text>
                  <Text>Gênero</Text>
                </View>

                {this.state.gender == '' &&
                  <TouchableOpacity style={styles.noPermission} onPress={() => this.askPermission()}>
                    <Icon name={'ios-eye'} style={styles.noPermissionText} />
                    <Text style={styles.noPermissionText}>
                      Pedir permissão para ver o gênero
                    </Text>
                  </TouchableOpacity>
                }
              </View>

              <View style={styles.infoRow}>
                <Icon name={'md-paper'} size={25} style={{ flex: 1, marginTop: 5 }} />
                <View style={{ flex: 10 }}>
                  <Text style={styles.information}>{this.state.about}</Text>
                  <Text>Sobre</Text>
                </View>

                {this.state.about == '' &&
                  <TouchableOpacity style={styles.noPermission} onPress={() => this.askPermission()}>
                    <Icon name={'ios-eye'} style={styles.noPermissionText} />
                    <Text style={styles.noPermissionText}>
                      Pedir permissão para ver sobre
                    </Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
          </ScrollView>
        }

        <View style={[styles.appBar, {
          backgroundColor: this.state.passouImagem ? 'rgb(61,133,198)' : 'rgba(0,0,0,0.5)',
        }]}>
          <TouchableOpacity style={styles.backbutton} onPress={() => this.props.navigation.goBack()}>
            <Icon name={'md-arrow-back'} size={28} color={'white'} />
          </TouchableOpacity>

          <Text style={{ color: this.state.passouImagem ? 'white' : 'transparent', fontSize: 23, paddingTop: 8, flex: 1, textAlign: 'center' }}>
            {this.state.name.split(" ").length ? this.state.name.split(" ")[0] : this.state.name}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => this.floatingMenu.toggle()}
          >
            <Icon name={this.state.menuOpen ? 'md-close' : 'md-more'} size={28} color={'white'} />
          </TouchableOpacity>

          <StatusBar backgroundColor="black" />
        </View>

        <FloatingActionMenu
          ref={ref => this._setFloatingMenu(ref)}
          onToggle={() => this.setState({ menuOpen: !this.state.menuOpen })}
          email={this.state.email}
          phone={this.state.phone}
          age={this.state.age}
          about={this.state.about}
          picture={this.state.picture}
          name={this.state.name}
          id={this.state.id}
          session={this.state.session}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appBar: {
    position: "absolute",
    left: 0,
    top: 0,
    flexDirection: 'row',
    height: 50,
    width: WIDTH,
    elevation: 2,
  },
  backgroundContainer: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'stretch',
    backgroundColor: "white"
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    width: WIDTH,
    opacity: 1,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    width: WIDTH,
    elevation: 3
  },
  photo: {
    height: WIDTH,
    width: WIDTH,
    backgroundColor: 'rgba(61,133,198,0.5)',
    position: 'relative',
  },
  information: {
    fontSize: 20
  },
  backbutton: {
    padding: 8,
    paddingLeft: 10,
    shadowOpacity: 0,
    elevation: 1,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    paddingLeft: 10,
    shadowOpacity: 0,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 5,
    borderRadius: 50,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 3,
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
    paddingBottom: 5,
    position: 'relative',
  },
  noPermission: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    flexDirection: 'row',
  },
  noPermissionText: {
    color: 'black',
    fontSize: 16,
    marginRight: 5,
  }
})
