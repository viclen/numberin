import React from 'react'
import FBSDK from 'react-native-fbsdk'

const { AccessToken, GraphRequest, GraphRequestManager, LoginManager } = FBSDK

class FacebookService {
    constructor() {
        this.requestManager = new GraphRequestManager()
    }

    makeLogin(callback) {
        LoginManager.logInWithReadPermissions([
            "public_profile",
            "email"
        ],
            (result) => {
                if (result.isCancelled) {

                } else {
                    console.log(result);
                    AccessToken.getCurrentAccessToken()
                        .then((data) => {
                            console.log(data)
                        })
                        .catch(error => {
                            console.log(error)
                        });
                }

                callback();
            },
            (error) => console.log(error));
    }

    async fetchProfile(callback) {
        return new Promise((resolve, reject) => {
            const request = new GraphRequest(
                '/me',
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

            this.requestManager.addRequest(request).start()
        })
    }
}

export const facebookService = new FacebookService()