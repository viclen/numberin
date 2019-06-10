import React, { Component } from 'react'
import { TouchableNativeFeedback, StyleSheet, Dimensions, View, Animated, Easing, Text, BackHandler, Image, ScrollView, TouchableOpacity, AsyncStorage, StatusBar, Vibration } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { Badge } from 'react-native-elements';
import ShortcutBadge from 'react-native-shortcut-badge';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');
const drawerSize = WIDTH * 0.7;

export default class Drawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            drawerPosition: new Animated.Value(-WIDTH * 1.2),
            drawerOpacity: new Animated.Value(0),
            drawerBackground: new Animated.Value(0),
            notificationCount: 0,
        }

        this.lastNotification = "";
        this.props.atual = props.atual || "";
    }

    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        Animated.timing(this.state.drawerBackground, {
            toValue: WIDTH,
            duration: 1,
        }).start();
        Animated.timing(this.state.drawerPosition, {
            toValue: 0,
            easing: Easing.in(),
            duration: 500,
        }).start();
        Animated.timing(this.state.drawerOpacity, {
            toValue: 1,
            easing: Easing.in(),
            duration: 500,
        }).start();
    }

    close() {
        Animated.timing(this.state.drawerPosition, {
            toValue: -WIDTH * 1.2,
            easing: Easing.in(),
            duration: 300,
        }).start();
        Animated.timing(this.state.drawerOpacity, {
            toValue: 0,
            easing: Easing.in(),
            duration: 300,
        }).start(() => {
            Animated.timing(this.state.drawerBackground, {
                toValue: 0,
                duration: 1,
            }).start();
        });
    }

    isOpen() {
        return this.state.drawerPosition._value > -1;
    }

    get() {
        return this;
    }

    _logout = async () => {
        try {
            await AsyncStorage.setItem('email', '');
            await AsyncStorage.setItem('password', '');
        } catch (error) {
            // Error saving data
        }
        this.props.navigation.navigate('Login');
        return true;
    };

    _updateNotifications() {
        setTimeout(() => this._updateNotifications(), 2000);

        let url = "http://autosavestudio.com/numberin/user/getNotifications.php?counter=1&session=" + this.props.session;

        try {
            fetch(url)
                .then((response) => response.json())
                .then(async (response) => {
                    var lastNumber = await AsyncStorage.getItem("NotificationCount");
                    this.setState({ notificationCount: response.count });
                    AsyncStorage.setItem("NotificationCount", response.count);

                    try {
                        ShortcutBadge.setCount(parseInt(response.count));
                    } catch (error) { }

                    if (response.count > lastNumber) {
                        Vibration.vibrate([0, 300, 150, 300]);
                    }
                });
        } catch (error) {
        }
    }

    // _getLastNotification() {
    //     let url = "http://autosavestudio.com/numberin/user/getNotifications.php?session=" + this.props.session;
    //     fetch(url)
    //         .then((response) => response.json())
    //         .then((response) => {
    //             if (response.length > 0) {
    //                 item = response[0];
    //                 var msg = (item.type == 'asked') ? `${item.name} pediu para ver seus dados.` : `${item.name} compartilhou dados com você.`;

    //                 if (msg != this.lastNotification) {
    //                     this.lastNotification = msg;

    //                     PushNotification.localNotification({
    //                         id: '123numberin',
    //                         autoCancel: true, // (optional) default: true
    //                         visibility: "public", // (optional) set notification visibility, default: private
    //                         message: msg, // (required)
    //                     });
    //                 }
    //             }
    //         }).catch((e) => {
    //         });
    // }

    _getImage() {
        setTimeout(() => this._getImage(), 10000);

        var url = "http://autosavestudio.com/numberin/user/me.php?session=" + this.props.session;

        fetch(url)
            .then(response => response.json())
            .then(response => {
                var obj = {
                    name: response.name.split(" ").length ? response.name.split(" ")[0] : response.name,
                    number: response.phone
                }

                if (this.state.picture.split("/images/")[1] != response.picture.split("/images/")[1]) {
                    obj.picture = "http://autosavestudio.com/numberin/user/compressed/" + response.picture.split("/images/")[1];
                    AsyncStorage.setItem("DrawerPicture", obj.picture);
                }

                this.setState(obj);
                AsyncStorage.setItem("DrawerName", obj.name);
                AsyncStorage.setItem("DrawerNumber", obj.number);
            });
    }

    componentDidMount() {
        this._start();
    }

    _start = async () => {
        if (this.props.name) {
            this.setState({
                name: this.props.name,
                number: this.props.number,
                picture: this.props.picture.uri
            });
            await AsyncStorage.setItem("DrawerName", this.props.name);
            await AsyncStorage.setItem("DrawerNumber", this.props.number);
            await AsyncStorage.setItem("DrawerPicture", this.props.picture.uri);
        } else {
            var name = await AsyncStorage.getItem("DrawerName");
            var number = await AsyncStorage.getItem("DrawerNumber");
            var picture = await AsyncStorage.getItem("DrawerPicture");
            this.setState({
                name,
                number,
                picture
            });
        }

        var notOpened = await AsyncStorage.getItem("OpenedNotification");

        if (notOpened == 1) {
            AsyncStorage.setItem("OpenedNotification", "0");
            this.props.navigation.navigate("Notifications", {
                onGoBack: () => BackHandler.addEventListener('hardwareBackPress', this.props.backPressed)
            });
            this.close();
        }

        this._updateNotifications();

        this._getImage();
    }

    render() {
        const { drawerPosition, drawerOpacity, drawerBackground } = this.state;

        return (
            <View style={styles.drawerContainer}>
                <Animated.View style={[styles.drawer, { left: drawerPosition }]}>
                    <View style={styles.header}>
                        <Image
                            source={{ uri: this.state.picture }}
                            style={styles.photo}
                        />
                        <Text style={styles.userName}>{this.state.name}</Text>
                        <Text style={styles.userNumber}>{this.state.number}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => this.close()}>
                            <Icon name={'md-close'} color={'black'} size={27} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ paddingTop: 10 }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Search")
                            this.close();
                        }} style={styles.menuItem}>
                            <Icon name={'ios-home'} style={[styles.menuIcon, { color: this.props.atual == 'Search' ? "rgb(61,133,198)" : "rgb(100,100,100)" }]} />
                            <Text style={[styles.menuItemText, { color: this.props.atual == 'Search' ? "black" : "rgb(100,100,100)" }]}>
                                Home
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider}></View>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("EditUser", {
                                onGoBack: () => BackHandler.addEventListener('hardwareBackPress', this.props.backPressed)
                            })
                            this.close();
                        }} style={styles.menuItem}>
                            <Icon name={'md-create'} style={styles.menuIcon} />
                            <Text style={styles.menuItemText}>
                                Editar dados
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider}></View>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Notifications", {
                                onGoBack: () => BackHandler.addEventListener('hardwareBackPress', this.props.backPressed)
                            });
                            this.close();
                        }} style={styles.menuItem}>
                            <Icon name={'ios-notifications'} style={[styles.menuIcon, { color: this.props.atual == 'Notifications' ? "rgb(61,133,198)" : "rgb(100,100,100)" }]} />
                            {this.state.notificationCount > 0 &&
                                <Badge value={this.state.notificationCount} status="error" containerStyle={styles.notificationCount} />
                            }
                            <Text style={[styles.menuItemText, { color: this.props.atual == 'Notifications' ? "black" : "rgb(100,100,100)" }]}>Notificações</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider}></View>
                        <TouchableOpacity onPress={() => alert("Ainda não disponível")} style={styles.menuItem}>
                            <Icon name={'ios-lock'} style={styles.menuIcon} />
                            <Text style={styles.menuItemText}>Mudar senha</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider}></View>
                        <TouchableOpacity onPress={() => this._logout()} style={styles.menuItem}>
                            <Icon name={'ios-log-out'} style={styles.menuIcon} />
                            <Text style={styles.menuItemText}>Sair</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                <TouchableNativeFeedback style={{ position: 'absolute', zIndex: 9 }} onPress={() => this.close()}>
                    <Animated.View style={[styles.close, { opacity: drawerOpacity, width: drawerBackground }]}></Animated.View>
                </TouchableNativeFeedback>

                <StatusBar backgroundColor={'rgb(61,133,198)'} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    drawerContainer: {
        flexDirection: 'row',
        height: HEIGHT,
        position: 'absolute',
        shadowColor: "#000",
        elevation: 10,
    },
    drawer: {
        width: drawerSize,
        height: HEIGHT,
        backgroundColor: 'white',
        alignItems: 'center',
        elevation: 3,
        zIndex: 11,
        paddingTop: 0,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        top: 0,
        position: 'absolute',
        flexDirection: 'column',
    },
    menuDivider: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: 1,
        width: drawerSize - 20,
        marginLeft: 10,
    },
    menuIcon: {
        color: 'rgb(100,100,100)',
        fontSize: 27,
        width: 26,
        paddingRight: 0,
    },
    notificationCount: {
        position: 'absolute',
        left: 20,
        top: 10,
    },
    close: {
        height: HEIGHT,
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    header: {
        width: drawerSize,
        height: 100,
        justifyContent: 'center',
        backgroundColor: '#e2e2e2',
        position: 'relative',
        flexDirection: 'row',
        borderBottomColor: 'rgb(61,133,198)',
        borderBottomWidth: 2,
        elevation: 10,
    },
    photo: {
        width: 70,
        height: 70,
        borderRadius: 70,
        position: 'absolute',
        left: 10,
        top: 15,
    },
    userName: {
        color: 'black',
        fontSize: 20,
        position: 'absolute',
        left: 90,
        bottom: 45,
    },
    userNumber: {
        color: 'rgb(61,133,198)',
        fontSize: 15,
        position: 'absolute',
        left: 90,
        bottom: 25,
    },
    menuItem: {
        flexDirection: 'row',
        width: drawerSize,
        padding: 10,
        position: 'relative',
    },
    menuItemText: {
        justifyContent: 'center',
        padding: 2,
        paddingLeft: 12,
        fontSize: 18,
        color: 'rgb(100,100,100)',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
    }
})