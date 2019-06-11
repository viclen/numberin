import React from 'react'
import FBSDK from 'react-native-fbsdk'

const { AccessToken, GraphRequest, GraphRequestManager, LoginManager } = FBSDK

class FacebookService {
    makeLogin(callback) {
        LoginManager.logInWithReadPermissions([
            "public_profile",
            "email"
        ]).then((result) => {
            if (result.isCancelled) {

            } else {
                console.log(result);
                AccessToken.getCurrentAccessToken()
                    .then((data) => {
                        const { accessToken } = data;
                        callback(accessToken);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }

        }, (error) => console.log(error))
        .catch((e) => {
            console.log(e);
        });
    }

    async fetchProfile(callback) {
        return new Promise((resolve, reject) => {
            const request = new GraphRequest(
                '/me?fields=email,name,friends',
                null,
                (error, result) => {
                    if (result) {
                        const profile = result
                        profile.avatar = `https://graph.facebook.com/${result.id}/picture`
                        resolve(profile)
                    } else {
                        reject(error)
                    }
                }
            )

            try {
                new GraphRequestManager().addRequest(request).start()
            } catch (error) {
                console.log(error)
            }
        })
    }
}

export const facebookService = new FacebookService()