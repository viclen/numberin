import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Dimensions, ImageBackground, TouchableOpacity, ActivityIndicator, AsyncStorage } from 'react-native';
import logo from './images/name.png';
import loginbackground from './images/loginbackground.png';
import Icon from 'react-native-vector-icons/Ionicons';
import FBSDK from 'react-native-fbsdk';
import { facebookService } from './FacebookService';

const { width: WIDTH } = Dimensions.get('window');
const { AccessToken, LoginButton } = FBSDK;

export default class Numberin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      loading: true,
      passwordError: false,
      checked: true,
      session: '',
      avatarImage: null,
      avatarData: null,
      id: 0,
    }
  }

  _storeData = async () => {
    console.log("Token: " + this.state.session);
    try {
      await AsyncStorage.setItem('id', this.state.id);
      await AsyncStorage.setItem('email', this.state.email);
      await AsyncStorage.setItem('password', this.state.password);
      await AsyncStorage.setItem('session', this.state.session);
    } catch (error) {
      // Error saving data
    }
    return true;
  };

  _retrieveData = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      const password = await AsyncStorage.getItem('password');
      if (email.length && password.length) {
        this.setState({ email, password });
        this._fazerLogin();
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      this.setState({ loading: false });
    }

    return true;
  };

  _fazerLogin() {
    this.setState({ loading: true });
    fetch("http://autosavestudio.com/numberin/login.php", {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.id > 0) {
          this.setState({ passwordError: false });
          if (this.state.checked) {
            this.setState({ session: responseJson.sessiontoken, id: responseJson.id });
            this._storeData();
          }
          setTimeout(() => {
            if (responseJson.lastlogin) {
              openEditUser = false;
            } else {
              openEditUser = true;
            }
            this.props.navigation.navigate('Search', {
              userName: responseJson.name,
              userPhone: responseJson.phone,
              userPhoto: responseJson.picture.includes("://") ? responseJson.picture : "http://autosavestudio.com/numberin/user/compressed/" + responseJson.picture,
              userId: responseJson.id,
              session: responseJson.sessiontoken,
              openEditUser: openEditUser
            });
            this.setState({ loading: false });
          }, 1500);
        } else if (responseJson.id == -1) {
          alert("Confirme seu email para prosseguir.");
          this.setState({ loading: false });
        } else {
          this.setState({ password: "", passwordError: true });
          this.setState({ loading: false });
        }
      }).catch((error) => {
        console.log("Error:" + error);
        this.setState({ loading: false });
      });
  }

  _registrar() {
    this.props.navigation.navigate('Register');
  }

  initUser(token) {
    console.log("Token: " + token);

    fetch('https://graph.facebook.com/v2.5/me?fields=email,name&access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        let user = {
          name: json.name,
          id: json.id,
          email: json.email,
          picture: "https://graph.facebook.com/" + json.id + "/picture",
        };

        this.props.navigation.navigate('Register', { facebookData: user, next: () => _retrieveData() });
      })
      .catch((e) => {
        console.log(e);
      })
  }

  componentDidMount() {
    console.disableYellowBox = true;
    this._retrieveData();
  }

  render() {
    return (
      <ImageBackground
        source={loginbackground}
        style={styles.backgroundContainer}>

        {this.state.loading &&
          <View style={styles.loading}>
            <Image source={logo} style={styles.logo}></Image>
            <ActivityIndicator size='large' color={'white'} />
          </View>
        }

        <View style={styles.container}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.loginText}>Fazer login</Text>
        </View>

        {this.state.passwordError &&
          <View>
            <Text style={styles.errorMsg}>Email ou senha incorretos.</Text>
          </View>
        }

        <View style={styles.inputGroup}>
          <Icon name={'ios-mail'} size={23} color={'white'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="white"
            underlineColorAndroid="transparent"
            onChangeText={(email) => this.setState({ email })}
            value={this.state.email}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon name={'ios-lock'} size={23} color={'white'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="white"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
          />
        </View>

        <TouchableOpacity style={{
          marginTop: 20,
          flexDirection: 'row',
          alignContent: 'center'
        }} onPress={() => this.setState({ checked: !this.state.checked })}>
          {this.state.checked &&
            <Icon name={'ios-checkbox'} size={25} color={'white'} />
          }
          {!this.state.checked &&
            <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />
          }
          <Text style={{
            color: 'white',
            fontSize: 17,
            paddingLeft: 10
          }}>Manter conectado</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this._fazerLogin()} style={styles.btnLogin}>
          <Text style={styles.textBtnLogin}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this._registrar()} style={styles.btnRegistrar}>
          <Text style={styles.textRegistrar}>Novo aqui? Registre-se</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnFacebookLogin}
          onPress={async () => {
            facebookService.makeLogin((token) => this.initUser(token));
          }}>
          <Icon name={'logo-facebook'} size={23} color={'white'} style={styles.inputIcon} />
          <Text style={styles.textBtnLogin}>Entrar com Facebook</Text>
        </TouchableOpacity>
      </ImageBackground >
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'stretch'
  },
  container: {
    alignItems: 'center'
  },
  logo: {
    width: 300,
    height: 100
  },
  loginText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 25,
    fontSize: 16,
    paddingLeft: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: 'white',
    marginHorizontal: 25
  },
  inputIcon: {
    position: 'absolute',
    top: 10,
    left: 37
  },
  inputGroup: {
    marginTop: 20
  },
  btnLogin: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'rgb(61,133,198)',
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  textBtnLogin: {
    color: 'white',
    fontSize: 18
  },
  btnFacebookLogin: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#4267b2',
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  btnRegistrar: {
    marginTop: 20
  },
  textRegistrar: {
    color: 'white',
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: 'white',
    fontSize: 14
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(61,133,198)',
    zIndex: 10
  },
  errorMsg: {
    color: '#ff6969',
    marginTop: 5,
    marginBottom: 5
  }
});