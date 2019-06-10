import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Contacts from 'react-native-contacts';

export default class FloatingActionMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            position: new Animated.Value(0),
        }
    }

    isOpen() {
        return this.state.position._value > 0.5;
    }

    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        Animated.timing(this.state.position, {
            toValue: 1,
            easing: Easing.elastic(),
            duration: 300,
            // useNativeDriver: true
        }).start(() => {
            if (this.props.onToggle) {
                this.props.onToggle();
            }
        });
    }

    close() {
        Animated.timing(this.state.position, {
            toValue: 0,
            easing: Easing.elastic(),
            duration: 300,
            // useNativeDriver: true
        }).start(() => {
            if (this.props.onToggle) {
                this.props.onToggle();
            }
        });
    }

    _addContact() {
        var phoneNumbers = [];
        var emailAddresses = [];
        if (this.props.phone != "") {
            phoneNumbers = [{
                label: "mobile",
                number: this.props.phone,
            }]
        }
        if (this.props.email != "") {
            emailAddresses = [{
                label: "mobile",
                email: this.props.email
            }]
        }

        var newPerson = {
            emailAddresses: emailAddresses,
            givenName: this.props.name,
            displayName: this.props.name,
            phoneNumbers: phoneNumbers,
        }

        Contacts.openContactForm(newPerson, (err, contact) => {
            if (err) console.log(err);
            // contact has been saved
        })
    }

    askPermission(){
        fetch('http://autosavestudio.com/numberin/user/askPermission.php?session=' + this.props.session + '&id=' + this.props.id)
        .then(() => {
            ToastAndroid.show("Pedido de permissão enviado.", ToastAndroid.LONG);
        });
    }

    allowPermission(){
        let url = 'http://autosavestudio.com/numberin/user/allowPermission.php?session=' + this.props.session + '&id=' + this.props.id + '&permission=111111';
        console.log(url)
        fetch(url)
        .then((r) => {
            if(!r.text()._55.includes("you"))
                ToastAndroid.show("Você enviou seus dados para " + this.props.name + ".", ToastAndroid.LONG);
        }).catch((error) => {
            ToastAndroid.show("Tente novamente");
        });
    }

    render() {
        return (
            <Animated.View
                scrollEventThrottle={1}
                style={[styles.container, {
                    top: this.state.position.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 50],
                    }),
                    scaleY: this.state.position,
                }]}>
                {(this.props.phone != '' || this.props.email != '') &&
                    <TouchableOpacity onPress={() => this._addContact()} style={styles.button}>
                        <Icon name={'md-person-add'} size={28} color={'white'} />
                    </TouchableOpacity>
                }
                {(this.props.email == "" ||
                    this.props.about == "" ||
                    this.props.age == "" ||
                    this.props.phone == "" ||
                    this.props.picture == "" ||
                    this.props.name.indexOf(" ") <= 0) &&
                    <TouchableOpacity style={styles.button} onPress={() => this.askPermission()}>
                        <Icon name={'ios-eye'} size={28} color={'white'} />
                    </TouchableOpacity>
                }
                <TouchableOpacity style={styles.button} onPress={() => this.allowPermission()}>
                    <Icon name={'md-send'} size={28} color={'white'} />
                </TouchableOpacity>
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: 'transparent',
        right: 5,
        elevation: 2,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        flexDirection: 'column',
        zIndex: 10,
        top: 50,
    },
    button: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(61,133,198)',
        borderRadius: 50,
        marginTop: 10,
        flex: 1,
    },
});