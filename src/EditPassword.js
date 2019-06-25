import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableOpacity, ActivityIndicator, ToastAndroid, ScrollView, StatusBar, BackHandler, AsyncStorage, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-datepicker';
import ImagePicker from 'react-native-image-picker';

const { width: WIDTH } = Dimensions.get('window');

export default class Numberin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oldPassword: "",
            newPassword: "",
            newPassword2: "",
            session: "",
            passwordError: false
        }
    }

    _getSession = async () => {
        session = await AsyncStorage.getItem('session');
        this.setState({ session: session });
    }

    _salvar() {
        this.setState({ passwordError: true });
        this.setState({ loading: true });

        if (this.state.newPassword != this.state.newPassword2) {
            this.setState({ loading: false, passwordError: true });
            return;
        } else {
            this.setState({ passwordError: false });
        }

        var data = {
            oldpassword: this.state.oldPassword,
            newpassword: this.state.newPassword
        };

        console.log(data);

        fetch("http://autosavestudio.com/numberin/alterarsenha.php?session=" + this.state.session, {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
                if (response.result == '1') {
                    this.props.navigation.goBack();
                    ToastAndroid.show('Senha alterada com sucesso.', ToastAndroid.LONG);
                } else {
                    ToastAndroid.show('Ops, ocorreu algum erro. Tente novamente.', ToastAndroid.LONG);
                }
                this.setState({ loading: false });
            })
            .catch(error => {
                ToastAndroid.show('Ops, ocorreu algum erro. Tente novamente.', ToastAndroid.LONG);
                this.setState({ loading: false });
                console.log(error);
            });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack()
        });

        console.disableYellowBox = true;

        this._getSession();
    }

    render() {
        return (
            <View
                style={styles.backgroundContainer}>

                <View style={{
                    height: 50,
                    left: 0,
                    right: 0,
                    position: 'relative',
                    backgroundColor: 'rgb(61,133,198)',
                    width: WIDTH,
                    alignItems: 'center',
                    shadowColor: 'black',
                    shadowOpacity: 1.0,
                    elevation: 5
                }}>
                    <TouchableOpacity style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: 50,
                        padding: 8,
                        paddingLeft: 10,
                        backgroundColor: 'rgb(61,133,198)',
                        justifyContent: 'center'
                    }} onPress={() => this.props.navigation.goBack()}>
                        <Icon name={'md-arrow-back'} size={28} color={'white'} />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>
                        Editar seus dados
                    </Text>
                </View>

                {this.state.loading &&
                    <View style={styles.loading}>
                        <ActivityIndicator size='large' color={'white'} />
                    </View>
                }

                <ScrollView>
                    <View style={styles.inputGroup}>
                        <Icon name={'ios-lock'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha Antiga"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            secureTextEntry={true}
                            onChangeText={(oldPassword) => this.setState({ oldPassword })}
                            value={this.state.oldPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Icon name={'ios-lock'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha nova"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            secureTextEntry={true}
                            onChangeText={(newPassword) => this.setState({ newPassword })}
                            value={this.state.newPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Icon name={'ios-lock'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Repetir senha"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            secureTextEntry={true}
                            onChangeText={(newPassword2) => this.setState({ newPassword2 })}
                            value={this.state.newPassword2}
                        />
                    </View>

                    {this.state.passwordError &&
                        <View>
                            <Text style={styles.errorMsg}>As novas senhas precisam ser iguais.</Text>
                        </View>
                    }

                    <TouchableOpacity onPress={() => this._salvar()} style={styles.btnLogin}>
                        <Text style={styles.textBtnLogin}>Salvar</Text>
                    </TouchableOpacity>
                </ScrollView>

                <StatusBar backgroundColor="rgb(61,133,198)" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'stretch',
        backgroundColor: 'rgb(250,250,250)'
    },
    container: {
        alignItems: 'center'
    },
    loginText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '500',
        marginTop: 10,
        alignSelf: 'center'
    },
    input: {
        width: WIDTH - 55,
        height: 45,
        borderRadius: 25,
        fontSize: 16,
        paddingLeft: 45,
        borderColor: 'gray',
        borderWidth: 1,
        color: 'black',
        marginHorizontal: 25
    },
    inputIcon: {
        position: 'absolute',
        top: 10,
        left: 37,
        zIndex: 10,
        color: 'rgb(61,133,198)'
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
        marginTop: 20,
        marginBottom: 20
    },
    textBtnLogin: {
        color: 'white',
        fontSize: 18
    }
});