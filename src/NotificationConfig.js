import React, { Component } from 'react';
import { AsyncStorage, View, PushNotificationIOS } from 'react-native';
import firebase from 'react-native-firebase';
import type { Notification } from 'react-native-firebase';
import ShortcutBadge from 'react-native-shortcut-badge';

export default class NotificationConfig extends Component {

    async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners(); //add this line
        this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        });
        this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
            // Process your notification as required
        });
    }

    ////////////////////// Add these methods //////////////////////

    //Remove listeners allocated in createNotificationListeners()
    componentWillUnmount() {
        this.notificationDisplayedListener();
        this.notificationListener();
        this.notificationOpenedListener();
    }

    async createNotificationListeners() {
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            // const { title, body } = notification;
        });

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            AsyncStorage.setItem("OpenedNotification", "1");
            ShortcutBadge.setCount(0);
        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            // const { title, body } = notificationOpen.notification;
            AsyncStorage.setItem("OpenedNotification", "1");
            ShortcutBadge.setCount(0);
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            //process data message
            ShortcutBadge.setCount(1);
        });
    }
    //1
    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    //3
    async getToken() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        let session = await AsyncStorage.getItem('session');
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }

        fetch("http://autosavestudio.com/numberin/notificationtoken.php?session=" + session + "&token=" + fcmToken);
    }

    //2
    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }

    render() {
        return (
            <View style={{ scaleX: 0, scaleY: 0, opacity: 0 }}>
            </View>
        );
    }
}