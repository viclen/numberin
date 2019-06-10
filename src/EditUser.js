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
            name: "",
            about: "",
            phone: "",
            birthday: "",
            permissions: "",
            gender: 1,
            loading: true,
            avatarImage: null,
            avatarData: "",
            avatarType: "",
            oldImageSrc: null,
            session: "",
            checkboxes: {
                name: false,
                picture: false,
                phone: false,
                age: false,
                about: false,
                gender: false,
                email: false
            }
        }
    }

    _getSession = async () => {
        session = await AsyncStorage.getItem('session');
        this.setState({ session: session });
    }

    _salvar() {
        this.setState({ loading: true });

        var imagestring = "";

        if (this.state.avatarData) {
            imagestring = "data:" + this.state.avatarType + ";base64," + this.state.avatarData;
        }

        permissions = this.state.checkboxes.name ? "1" : "0";
        permissions += this.state.checkboxes.picture ? "1" : "0";
        permissions += this.state.checkboxes.phone ? "1" : "0";
        permissions += this.state.checkboxes.email ? "1" : "0";
        permissions += this.state.checkboxes.about ? "1" : "0";
        permissions += this.state.checkboxes.age ? "1" : "0";
        permissions += this.state.checkboxes.gender ? "1" : "0";

        birthday = this.state.birthday.split("/")[2] + '-' + this.state.birthday.split("/")[1] + '-' + this.state.birthday.split("/")[0];

        fetch("http://autosavestudio.com/numberin/user/updateUser.php?session=" + this.state.session, {
            method: 'POST',
            body: JSON.stringify({
                name: this.state.name,
                birthday: birthday,
                imagestring: imagestring,
                about: this.state.about,
                permissions: permissions,
                phone: this.state.phone,
                gender: this.state.gender
            })
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.result == '1') {
                    ToastAndroid.show('Salvo.', ToastAndroid.LONG);
                    this.props.navigation.goBack();
                } else {
                    ToastAndroid.show('Ops, ocorreu algum erro. Tente novamente.', ToastAndroid.LONG);
                }
                this.setState({ loading: false });
            })
            .catch(error => {
                ToastAndroid.show('Ops, ocorreu algum erro. Tente novamente.', ToastAndroid.LONG);
                this.setState({ loading: false });
            });
    }

    _takePicture() {
        ImagePicker.launchCamera({
            title: 'Tirar foto',
        }, (response) => {
            try {
                if (response.data == null || response.data == '') {
                    return;
                }
                const source = { uri: response.uri };

                this.setState({
                    avatarImage: source,
                    avatarData: response.data,
                    avatarType: response.type
                });
            } catch (e) { }
        });
    }

    _selectImage() {
        ImagePicker.launchImageLibrary({
            title: 'Selecionar imagem',
        }, (response) => {
            try {
                if (response.data == null || response.data == '') {
                    return;
                }
                const source = { uri: response.uri };

                this.setState({
                    avatarImage: source,
                    avatarData: response.data,
                    avatarType: response.type
                });
            } catch (e) { }
        });
    }

    _fetchOldData() {
        if (this.state.session == undefined || this.state.session == "") {
            setTimeout(() => this._fetchOldData(), 200);
            return;
        }

        var url = "http://autosavestudio.com/numberin/user/me.php?session=" + this.state.session;

        fetch(url)
            .then(response => response.json())
            .then(response => {
                birthday = response.birthday.split("-")[2] + '/' + response.birthday.split("-")[1] + '/' + response.birthday.split("-")[0];

                var permissions = response.permissions;
                var name = false;
                var picture = false;
                var phone = false;
                var age = false;
                var about = false;
                var gender = false;
                var email = false;

                if (permissions.charAt(0) == '1') {
                    name = true
                }
                if (permissions.charAt(1) == '1') {
                    picture = true
                }
                if (permissions.charAt(2) == '1') {
                    phone = true
                }
                if (permissions.charAt(3) == '1') {
                    email = true
                }
                if (permissions.charAt(4) == '1') {
                    about = true
                }
                if (permissions.charAt(5) == '1') {
                    age = true
                }
                if (permissions.charAt(6) == '1') {
                    gender = true
                }

                this.setState({
                    birthday,
                    about: response.about,
                    name: response.name,
                    phone: response.phone,
                    oldImageSrc: { uri: response.picture },
                    permissions: response.permissions,
                    gender: response.gender,
                    loading: false,
                    checkboxes: {
                        name,
                        picture,
                        phone,
                        age,
                        about,
                        gender,
                        email
                    }
                });
            });
    }

    setPermissions(p) { //0=name, 1=picture, 2=phone, 3=email, 4=about, 5=age
        var name = this.state.checkboxes.name;
        var picture = this.state.checkboxes.picture;
        var phone = this.state.checkboxes.phone;
        var age = this.state.checkboxes.age;
        var about = this.state.checkboxes.about;
        var gender = this.state.checkboxes.gender;
        var email = this.state.checkboxes.email;

        switch (p) {
            case "name":
                name = !name;
                break;
            case "about":
                about = !about;
                break;
            case "phone":
                phone = !phone;
                break;
            case "age":
                age = !age;
                break;
            case "picture":
                picture = !picture;
                break;
            case "gender":
                gender = !gender;
                break;
            case "email":
                email = !email;
                break;
        }

        this.setState({
            checkboxes: {
                name,
                picture,
                phone,
                age,
                about,
                gender,
                email,
            }
        })
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack()
        });

        console.disableYellowBox = true;

        this._getSession();

        setTimeout(() => this._fetchOldData(), 1000);
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
                    <View style={{
                        position: 'relative',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 300,
                        width: 200,
                        alignSelf: 'center',
                        marginTop: 5
                    }}>
                        <Image source={this.state.avatarImage || this.state.oldImageSrc} style={{
                            height: 200,
                            borderRadius: 100
                        }} />
                        <TouchableOpacity onPress={() => this._selectImage()} style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            borderWidth: 4,
                            borderColor: 'white',
                            borderRadius: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgb(61,133,198)',
                            width: 50,
                            height: 50,
                        }}>
                            <Icon name={'md-photos'} color={'white'} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this._takePicture()} style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            borderWidth: 4,
                            borderColor: 'white',
                            borderRadius: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgb(61,133,198)',
                            width: 50,
                            height: 50,
                        }}>
                            <Icon name={'ios-camera'} color={'white'} size={30} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Icon name={'ios-contact'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            onChangeText={(name) => this.setState({ name })}
                            value={this.state.name}
                        />
                    </View>

                    <View style={{
                        borderColor: 'gray',
                        borderWidth: 1,
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
                                    color: 'black'
                                },
                                placeholderText: {
                                    color: 'black'
                                }
                            }}
                            onDateChange={(date) => { this.setState({ birthday: date }) }}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Icon name={'md-call'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Telefone"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            onChangeText={(phone) => this.setState({ phone })}
                            value={this.state.phone}
                        />
                    </View>

                    <View style={{
                        marginTop: 20,
                        borderRadius: 50,
                        borderColor: 'gray',
                        borderWidth: 1,
                        width: WIDTH - 55,
                        alignSelf: 'center'
                    }}>
                        <Icon name={'md-transgender'} size={23} color={'rgb(61,133,198)'} style={{
                            position: "absolute",
                            top: 12,
                            left: 10
                        }} />
                        <Picker
                            selectedValue={this.state.gender}
                            style={{
                                height: 45,
                                borderRadius: 25,
                                fontSize: 16,
                                color: 'black',
                                marginLeft: 35,
                                backgroundColor: 'transparent'
                            }}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ gender: itemValue })
                            }>
                            <Picker.Item label="Gênero" value="0" />
                            <Picker.Item label="Masculino" value="1" />
                            <Picker.Item label="Feminino" value="2" />
                        </Picker>
                    </View>

                    <View style={styles.inputGroup}>
                        <Icon name={'ios-chatbubbles'} size={23} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { textAlignVertical: 'top' }]}
                            placeholder="Fale sobre você"
                            placeholderTextColor="black"
                            underlineColorAndroid="transparent"
                            onChangeText={(about) => this.setState({ about })}
                            value={this.state.about}
                            multiline={true}
                            height={200}
                        />
                    </View>

                    <View style={{
                        padding: 15,
                        marginTop: 10,
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 20,
                        width: WIDTH - 55,
                        alignSelf: 'center'
                    }}>
                        <View style={{
                            flexDirection: 'row'
                        }}>
                            <Icon name={'md-warning'} size={23} color={'rgb(61,133,198)'} />
                            <Text style={{
                                fontSize: 20,
                                color: 'black',
                                paddingLeft: 10
                            }}>Permissões</Text>
                        </View>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('name')}>
                            {this.state.checkboxes.name && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.name || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar nome
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('picture')}>
                            {this.state.checkboxes.picture && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.picture || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar foto
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('phone')}>
                            {this.state.checkboxes.phone && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.phone || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar telefone
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('email')}>
                            {this.state.checkboxes.email && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.email || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar email
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('age')}>
                            {this.state.checkboxes.age && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.age || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar idade
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('about')}>
                            {this.state.checkboxes.about && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.about || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar sobre
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkGroup} onPress={() => this.setPermissions('gender')}>
                            {this.state.checkboxes.gender && <Icon name={'ios-checkbox'} size={25} color={'#008e09'} />}
                            {this.state.checkboxes.gender || <Icon name={'ios-checkbox-outline'} size={25} color={'#777'} />}
                            <Text style={styles.checkText}>
                                Mostrar gênero
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => this._salvar()} style={styles.btnLogin}>
                        <Text style={styles.textBtnLogin}>Salvar dados</Text>
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
    logo: {
        width: 200,
        height: 70,
        marginTop: 30
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
    },
    checkGroup: {
        marginTop: 20,
        flexDirection: 'row',
        alignContent: 'center'
    },
    checkText: {
        color: 'black',
        fontSize: 17,
        paddingLeft: 10
    }
});