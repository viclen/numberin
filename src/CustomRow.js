import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: 2,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 0,
        backgroundColor: 'white'
    },
    container_text: {
        flex: 9,
        flexDirection: 'column',
        marginLeft: 12,
        justifyContent: 'center',
    },
    photo: {
        height: 50,
        width: 50,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.6)"
    },
    updatetime: {
        position: 'absolute',
        bottom: 10,
        right: 30,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        color: "rgb(30,30,30)",
    },
    name: {
        fontSize: 16,
        color: "rgb(30,30,30)",
    },
    phone: {
        color: "rgb(30,30,30)",
    }
});

const CustomRow = ({ name, picture, onClick, lasttime }) => (
    <TouchableOpacity
        style={styles.container}
        onPress={() => onClick()}
    >
        <View style={{
            justifyContent: "center",
            flex: 2,
            alignContent: 'flex-end'
        }}>
            <Image source={{ uri: picture != '' ? picture : 'http://autosavestudio.com/numberin/user.png' }} style={styles.photo} />
        </View>
        <View style={styles.container_text}>
            <Text style={styles.name}>
                {name}
            </Text>
            <Text style={styles.phone}>
                há {Math.floor(lasttime / 60)} minutos
            </Text>
        </View>
        <View style={{
            justifyContent: "center",
            flex: 1
        }}>
            <Icon name={'ios-arrow-forward'} style={{
                color: '#CCC',
                fontSize: 23
            }} />
        </View>
    </TouchableOpacity>
);

export default CustomRow;