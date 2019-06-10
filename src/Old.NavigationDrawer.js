import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Animated, StatusBar, AsyncStorage, BackHandler, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export default class NavigationDrawer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            picture: props.userImage,
            name: props.name,
            open: false,
            drawerBackgroundSize: new Animated.Value(-WIDTH),
        }

        this.animatedValue = new Animated.Value(0);
    }

    isOpen() {
        return this.state.drawerPosition._value > -1;
    }

    toggle() {
        if (isOpen()) {
            this.close();
        } else {
            this.open();
        }
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
        return true;
    }

    open() {
        this.state.drawerBackgroundSize.setValue(0);
        Animated.timing(this.animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            this.setState({ open: true });
        });
        return true;
    }

    close() {
        this.setState({ open: false });
        Animated.timing(this.animatedValue, {
            toValue: 0,
            duration: 500,
            easing: Easing.elastic(),
            useNativeDriver: true,
        }).start(() => {
            this.state.drawerBackgroundSize.setValue(-WIDTH);
        });
        return true;
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

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this._backPressed);
    }

    render() {
        const width = WIDTH - 60;
        const endX = 0;
        const startX = -WIDTH;
        const position = {
            transform: [
                {
                    translateX: this.animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startX - (width / 2) - (width * width / 2), endX]
                    })
                },
                { perspective: 1000 }
            ]
        };

        return (
            <Animated.View style={[styles.drawerBackground, { left: this.state.drawerBackgroundSize }]}>
                <Animated.View
                    style={[styles.navCloser, { opacity: this.animatedValue }]}
                    onTouchStart={() => this.close()}
                />
                <Animated.View style={[styles.navDrawer, position]}>
                    <View style={styles.header}>
                        <Image
                            source={this.state.picture}
                            style={styles.photo}
                        />
                        <Text style={styles.userName}>{this.state.name}</Text>
                    </View>
                    <ScrollView>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("EditUser", {
                            onGoBack: () => BackHandler.addEventListener('hardwareBackPress', this._backPressed)
                        })} style={styles.menuItem}>
                            <Icon name={'md-create'} color={'black'} size={25} />
                            <Text style={styles.menuItemText}>
                                Editar dados
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => alert("Ainda não disponível")} style={styles.menuItem}>
                            <Icon name={'ios-lock'} color={'black'} size={25} />
                            <Text style={styles.menuItemText}>Mudar senha</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this._logout()} style={styles.menuItem}>
                            <Icon name={'ios-log-out'} color={'black'} size={25} />
                            <Text style={styles.menuItemText}>Sair</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
                {this.state.open &&
                    <StatusBar backgroundColor="black" />
                }
                {this.state.open ||
                    <StatusBar backgroundColor="rgb(61,133,198)" />
                }
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    drawerBackground: {
        position: 'absolute',
        width: WIDTH,
        left: -WIDTH
    },
    navDrawer: {
        position: 'absolute',
        width: WIDTH - 80,
        elevation: 11,
        shadowColor: 'transparent',
        backgroundColor: 'white',
        height: HEIGHT,
    },
    navCloser: {
        position: 'absolute',
        width: WIDTH,
        elevation: 10,
        shadowColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: HEIGHT,
    },
    header: {
        height: 80,
        backgroundColor: 'rgb(50,50,50)',
        justifyContent: 'center',
        position: 'relative',
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 100,
        position: 'absolute',
        left: 10,
        bottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        width: "100%",
        padding: 10,
    },
    menuItemText: {
        justifyContent: 'center',
        padding: 3,
        paddingLeft: 10,
        fontSize: 16,
    },
    userName: {
        color: 'white',
        position: 'absolute',
        fontSize: 20,
        bottom: 25,
        left: 80,
    }
});