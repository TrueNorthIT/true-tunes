import { Configuration, LogLevel } from "@azure/msal-node";

export const msalConfig = {
    auth: {
        clientId: "be80b4d7-18c2-4e92-8dea-eb88116db09b",  // Your app's client ID from Azure AD
        authority: "https://login.microsoftonline.com/526f9dcc-8415-4bb2-9532-a5490a6e7cc1", // The tenant or authority URL
        redirectUri: 'http://localhost:3000/',  // A redirect URI for the Electron app
    },
    scopes: ["user.read"],  // The scopes you need to request
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                console.log(`[MSAL] ${message}`);
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose,
        },
    },
};
