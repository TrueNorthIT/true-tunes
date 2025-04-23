import path from "path";
import * as msal from '@azure/msal-node'

import { DataProtectionScope, Environment, PersistenceCreator, PersistenceCachePlugin, IPersistenceConfiguration } from "@azure/msal-node-extensions";
import { msalConfig } from '../renderer/msalConfig'
import { shell } from "electron";
import axios from "axios";


interface UserDetails {
    name: string;
    email: string;
    profilePicture: string;
}


interface TokenRequest {
    scopes: string[];
}


export default class AuthManager {

    private cachePath = path.join(Environment.getUserRootDirectory(), "./cache.json");
    private persistenceConfiguration: IPersistenceConfiguration;

    private account: msal.AccountInfo | null = null;

    private pca: msal.PublicClientApplication | null = null;
    private cache: msal.TokenCache | null = null;

    private bearerToken: string | null = null;

    private currentUser: UserDetails | null = null;

    constructor() {

        this.persistenceConfiguration = {
            cachePath: this.cachePath,
            dataProtectionScope: DataProtectionScope.CurrentUser
        };
    }

    private async handleResponse(response: msal.AuthenticationResult) {
        if (response !== null) {
            this.account = response.account;
            this.bearerToken = response.accessToken;

            this.currentUser = {
                name: response.account.name,
                email: response.account.username,
                profilePicture: await this.getProfilePicture()
            };



        } else {
            this.account = await this.getAccount();
        }

        return this.account;
    }


    private async getProfilePicture(): Promise<string> {
        try {
            // Make an API call to Microsoft Graph to get the user's profile picture
            const response = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
                headers: {
                    Authorization: `Bearer ${this.getBearerToken()}`,  // Pass the access token in the headers
                    'Content-Type': 'image/jpeg',  // The response will be a binary image (JPEG)
                },
                responseType: 'arraybuffer',  // Important: fetch the photo as a binary buffer
            });

            // Convert the binary data to a base64-encoded string
            const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');
            const imageBase64 = `data:image/jpeg;base64,${imageBuffer}`;

            return imageBase64;
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            throw error;
        }
    };

    public getBearerToken() {
        if (!this.pca) throw new Error('Call Setup first!');
        if (this.bearerToken === null) throw new Error('No token available');

        return this.bearerToken;
    }

    public getCurrentUser() {

        return this.currentUser;
    }

    public async login(loginOptions?: { optimistic: boolean }) {
        if (this.pca === null) throw new Error('Call Setup first!')

        const authResponse = await this.getToken({
            scopes: msalConfig.scopes,
        }, loginOptions);

        return this.handleResponse(authResponse);
    }

    public async logout() {
        if (!this.account) return;
        await this.cache.removeAccount(this.account);
        this.account = null;
    }

    private async getAccount() {
        if (this.pca === null) throw new Error('Call Setup first!')

        const currentAccounts = await this.cache.getAllAccounts();

        if (!currentAccounts) {
            console.log('No accounts detected');
            return null;
        }

        if (currentAccounts.length > 1) {
            // Add choose account code here
            console.log('Multiple accounts detected, need to add choose account code.');
            return currentAccounts[0];
        } else if (currentAccounts.length === 1) {
            return currentAccounts[0];
        } else {
            return null;
        }
    }

    private async getToken(tokenRequest: TokenRequest, loginOptions?: { optimistic: boolean }): Promise<msal.AuthenticationResult | null> {
        if (this.pca === null) throw new Error('Call Setup first!')

        let authResponse;
        const account = this.account || (await this.getAccount());

        if (account) {
            authResponse = await this.getTokenSilent({ ...tokenRequest, account });
        } else if (!loginOptions || !loginOptions.optimistic) {
            authResponse = await this.getTokenInteractive(tokenRequest);
        }

        return authResponse || null;
    }

    private async getTokenInteractive(tokenRequest: TokenRequest): Promise<msal.AuthenticationResult | null> {
        if (this.pca === null) throw new Error('Call Setup first!')

        try {
            const openBrowser = async (url) => {
                await shell.openExternal(url);
            };

            const authResponse = await this.pca.acquireTokenInteractive({
                ...tokenRequest,
                openBrowser,
                successTemplate:
                    `
                    <html style="background-color: #001f3f; color: white;font-size: 64px;font-family: &quot;Helvetica&quot;;"><body><div style="text-align: center; padding: 50px 0;">
                            <h1 style="margin-bottom: 10px;">Successfully logged in!</h1>
                            <h3 style="">Please close this window and enjoy TrueTunes</h3>
                        </div>                    
                        </body>
                    </html>
                    `,
                errorTemplate:
                `
                <html style="background-color: #001f3f; color: white;font-size: 64px;font-family: &quot;Helvetica&quot;;"><body><div style="text-align: center; padding: 50px 0;">
                        <h1 style="margin-bottom: 10px;">Something went wrong!</h1>
                        <h3 style="">Blame Richard!</h3>
                    </div>                    
                    </body>
                </html>
                `,            });

            return authResponse;
        } catch (error) {
            throw error;
        }
    }

    private async getTokenSilent(tokenRequest: TokenRequest & { account: msal.AccountInfo }): Promise<msal.AuthenticationResult | null> {
        if (this.pca === null) throw new Error('Call Setup first!')

        try {
            return await this.pca.acquireTokenSilent(tokenRequest);
        } catch (error) {
            if (error instanceof msal.InteractionRequiredAuthError) {
                console.log('Silent token acquisition failed, acquiring token interactive');
                return await this.getTokenInteractive(tokenRequest);
            }

            console.log(error);
        }
    }

    public async Setup() {
        const persistence = await PersistenceCreator.createPersistence(this.persistenceConfiguration);
        const publicClientConfig = {
            ...msalConfig,
            cache: {
                cachePlugin: new PersistenceCachePlugin(persistence)
            }
        };

        this.pca = new msal.PublicClientApplication(publicClientConfig);
        this.cache = this.pca.getTokenCache();
    }




}