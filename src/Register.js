import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Dimensions, ImageBackground, TouchableOpacity, ActivityIndicator, ToastAndroid, ScrollView, BackHandler, AsyncStorage } from 'react-native';
import logo from './images/name.png';
import loginbackground from './images/loginbackground.png';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-datepicker';

const { width: WIDTH } = Dimensions.get('window');

export default class Numberin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      repeatPassword: "",
      name: "",
      birthday: null,
      loading: false,
      passwordError: false,
      informationError: false,
      facebookPicture: "",
      facebookId: "",
    }

    var fbdata = this.props.navigation.getParam('facebookData');

    if (fbdata) {
      this.state.email = fbdata.email;
      this.state.name = fbdata.name;
      this.state.facebookPicture = fbdata.picture;
      this.state.facebookId = fbdata.id;

      this.next = () => this.props.navigation.getParam('next')();
    }
  }

  _fazerRegistro() {
    this.setState({ informationError: false, passwordError: true });
    this.setState({ loading: true });

    if (this.state.password != this.state.repeatPassword) {
      this.setState({ loading: false, passwordError: true });
      return;
    } else {
      this.setState({ passwordError: false });
    }

    if (this.state.email == "" || this.state.password == "" || this.state.name == "" || this.state.birthday == "" || this.state.email.indexOf("@") < 1 || this.state.email.indexOf(".") < 1) {
      this.setState({ loading: false, informationError: true });
      return;
    } else {
      this.setState({ informationError: false });
    }

    try{
      birthday = this.state.birthday.split("/")[2] + '-' + this.state.birthday.split("/")[1] + '-' + this.state.birthday.split("/")[0];
    }catch(e){
      this.setState({ loading: false, informationError: true });
      return;
    }

    var data = {
      email: this.state.email,
      password: this.state.password,
      name: this.state.name,
      birthday: birthday,
      facebookPicture: this.state.facebookPicture,
      facebookId: this.state.facebookId,
    };

    fetch("http://autosavestudio.com/numberin/user/registerUser.php", {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.result == '1') {
          alert("Um email foi enviado para " + this.state.email + " com o código de ativação.");
          this.props.navigation.navigate('Login');
        } else if (response.result == '2') {
          AsyncStorage.setItem('email', this.state.email).then(() => {
            AsyncStorage.setItem('password', this.state.password).then(() => {
              this.props.navigation.navigate('Login');
            });
          });
        } else {
          ToastAndroid.show('Ops, ocorreu algum erro. Tente novamente.', ToastAndroid.LONG);
        }
        this.setState({ loading: false });
      })
      .catch(error => {
        console.log(error);
      });
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.goBack()
      return true;
    });

    console.disableYellowBox = true;
  }

  render() {
    return (
      <ImageBackground
        source={loginbackground}
        style={styles.backgroundContainer}>

        {this.state.loading &&
          <View style={styles.loading}>
            <ActivityIndicator size='large' color={'white'} />
          </View>
        }

        <ScrollView>
          <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.loginText}>Registrar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Icon name={'ios-contact'} size={23} color={'white'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="white"
              underlineColorAndroid="transparent"
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
            />
          </View>

          <View style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: 100,
            width: WIDTH - 55,
            padding: 0,
            marginTop: 20,
            position: 'relative',
            justifyContent: 'center',
            height: 45,
            alignSelf: 'center'
          }}>
            <DatePicker
              style={{ width: WIDTH - 55 }}
              date={this.state.birthday}
              mode="date"
              format="DD/MM/YYYY"
              confirmBtnText="Confirmar"
              placeholder="Data de nascimento"
              cancelBtnText="Cancelar"
              customStyles={{
                dateIcon: {
                  position: 'absolute',
                  left: 6,
                  top: 8,
                  height: 23,
                  width: 23
                },
                dateInput: {
                  borderColor: 'transparent',
                  position: 'absolute',
                  left: 45
                },
                dateText: {
                  color: 'white'
                },
                placeholderText: {
                  color: 'white'
                }
              }}
              onDateChange={(date) => { this.setState({ birthday: date }) }}
            />
          </View>

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
          <View style={styles.inputGroup}>
            <Icon name={'ios-lock'} size={23} color={'white'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repetir senha"
              placeholderTextColor="white"
              underlineColorAndroid="transparent"
              secureTextEntry={true}
              onChangeText={(repeatPassword) => this.setState({ repeatPassword })}
              value={this.state.repeatPassword}
            />
          </View>

          {this.state.passwordError &&
            <View>
              <Text style={styles.errorMsg}>As senhas precisam ser iguais.</Text>
            </View>
          }

          {this.state.informationError &&
            <View>
              <Text style={styles.errorMsg}>Preencha todos os dados corretamente.</Text>
            </View>
          }

          <TouchableOpacity onPress={() => this._fazerRegistro()} style={styles.btnLogin}>
            <Text style={styles.textBtnLogin}>Registrar</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={{
          position: "absolute",
          left: 0,
          top: 0,
          padding: 8,
          paddingLeft: 15,
          width: 50,
          backgroundColor: 'transparent'
        }} onPress={() => this.props.navigation.goBack()}>
          <Icon name={'md-arrow-back'} size={28} color={'white'} />
        </TouchableOpacity>
      </ImageBackground>
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
    width: 200,
    height: 70,
    marginTop: 30
  },
  loginText: {
    color: 'white',
    fontSize: 30,
    fontWeight: '500',
    marginTop: 10
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
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10
  },
  errorMsg: {
    color: '#ff6969',
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'center'
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
});