import path from 'path'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { SonosGroupManager } from './SonosGroupManager'
import { msalConfig } from '../renderer/msalConfig'
import { AuthenticationResult, PublicClientApplication } from '@azure/msal-node'
import http from 'http'
const isProd = process.env.NODE_ENV === 'production'
import url from 'url'
import ElectronStore from 'electron-store'
export let mainWindow: Electron.BrowserWindow | null = null;
const Store = require('electron-store');  // Import Electron Store

const SERVICE_NAME = 'TrueTunes';
const ACCOUNT_NAME = 'user-access-token';

let authResult : AuthenticationResult | null = null;  // Store the AuthenticationResult object in memory
const msalInstance = new PublicClientApplication(msalConfig);
const store = new Store();

// Helper function to check if the token is expired
function isTokenExpired(expiresOn) {
  if (!expiresOn) return true;  // If no expiry time is stored, consider it expired
  const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
  return currentTime >= Math.floor(new Date(expiresOn).getTime() / 1000);  // Compare current time with token expiry
}

// Retrieve the AuthenticationResult from secure storage when the app starts
// Retrieve the AuthenticationResult from Electron Store when the app starts
function retrieveStoredAuthResult() {
  authResult = store.get('authResult');  // Retrieve from Electron Store
  if (authResult) {
    console.log('AuthenticationResult retrieved from Electron Store on startup');
  } else {
    console.log('No AuthenticationResult found in Electron Store');
  }
}

// Store the AuthenticationResult in Electron Store
function storeAuthResult(authResult) {
  store.set('authResult', authResult);  // Store in Electron Store
  console.log('AuthenticationResult stored in Electron Store');
}

// Clear the stored AuthenticationResult from Electron Store
function clearAuthResult() {
  store.delete('authResult');  // Remove from Electron Store
  console.log('AuthenticationResult cleared from Electron Store');
}

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()
  await retrieveStoredAuthResult();
  mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./music')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/music`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

ipcMain.handle('clear-token', async () => {
  try {
    authResult = null;  // Clear the in-memory token
    clearAuthResult();  // Clear the stored token
    console.log('Token cleared successfully');
  } catch (error) {
    console.error('Error clearing token:', error);
  }
});


async function acquireTokenSilently() {
  try {
    const silentRequest = {
      account: authResult.account,
      scopes: authResult.scopes,
    };
    const tokenResponse = await msalInstance.acquireTokenSilent(silentRequest);
    authResult = tokenResponse;  // Update the AuthenticationResult object
    storeAuthResult(tokenResponse);  // Store the updated result

    console.log('Token refreshed successfully using acquireTokenSilent');
  } catch (error) {
    authResult = null;  // Clear the in-memory token
    console.error('Error refreshing token silently:', error);
  }
}

let server;
ipcMain.handle('auth-login', async (event, loginOptions?: {optimistic: boolean} ) : Promise<AuthenticationResult | null> => {
  return new Promise(async (resolve, reject) => {

    if (authResult && !isTokenExpired(authResult.expiresOn)) {
      console.log('Using stored token for login');
      resolve(authResult);  // Return the entire AuthenticationResult object
      return;
    }
  
    if (authResult && authResult.account) {
      await acquireTokenSilently();  // Try to refresh the token silently
      if (authResult) {
        resolve(authResult);  // Return the refreshed AuthenticationResult
        return;
      }
    }

    if (loginOptions?.optimistic) {
      resolve(null);
      return;
    }

    if (server) {
      server.close();
    }
    server = http.createServer(async (req, res) => {
      const queryObject = url.parse(req.url, true).query;

      // Ensure the queryObject.code is a string and not an array
      const authorizationCode = Array.isArray(queryObject.code) ? queryObject.code[0] : queryObject.code;

      if (authorizationCode) {
        try {
          // Exchange the authorization code for a token (MSAL automatically handles PKCE)
          const tokenResponse = await msalInstance.acquireTokenByCode({
            code: authorizationCode,
            scopes: msalConfig.scopes,
            redirectUri: msalConfig.auth.redirectUri,
          });
          storeAuthResult(tokenResponse);  // Store the result securely

          res.end('Login successful! You can close this window.');
          resolve(tokenResponse);
        } catch (error) {
          res.end('Error during login. Please try again.');
          reject(error);
        } finally {
          server.close();
        }
      } else {
        res.end('No authorization code received.');
        reject(new Error('No authorization code received.'));
        server.close();
      }
    });

    server.listen(3000, () => {
      console.log('Listening on http://localhost:3000');

      // Open the system browser for authentication (MSAL automatically handles PKCE)
      msalInstance.getAuthCodeUrl({
        scopes: msalConfig.scopes,
        redirectUri: msalConfig.auth.redirectUri,
      }).then((authUrl) => {
        shell.openExternal(authUrl); // Opens the system default browser for login
      }).catch((error) => {
        console.error('Error generating auth code URL:', error);
        reject(error);
      });
    });
  });
});

const axios = require('axios'); // Use axios to make API calls

// After successfully logging in, fetch the user's profile picture
ipcMain.handle('get-user-photo', async (event, accessToken: string) => {
  try {
    // Make an API call to Microsoft Graph to get the user's profile picture
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: {
        Authorization: `Bearer ${accessToken}`,  // Pass the access token in the headers
        'Content-Type': 'image/jpeg',  // The response will be a binary image (JPEG)
      },
      responseType: 'arraybuffer',  // Important: fetch the photo as a binary buffer
    });

    // Convert the binary data to a base64-encoded string
    const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');
    const imageBase64 = `data:image/jpeg;base64,${imageBuffer}`;

    return imageBase64;  // Return the base64-encoded image string to the renderer process
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    throw error;
  }
});

const sonosManager = new SonosGroupManager();

ipcMain.handle('connect', async (event, groupName) => {
  await sonosManager.Connect(groupName);
  return 'Connected';
});

ipcMain.handle('search', async (event, term, searchType) => {
  const result = await sonosManager.Search(term, searchType, 9);
  return result;
});

ipcMain.handle('getQueue', async (event) => {
  const result = await sonosManager.GetQueue();
  return result;
});

ipcMain.handle('connectToServices', async (event) => {
  await sonosManager.ConnectToServices();
  return 'Connected';
});

ipcMain.handle('getConnectionStatus', async (event) => {
  const result = await sonosManager.GetConnectionStatus();
  return result;
});

ipcMain.handle('getMusicServiceRootPage', async (event, service) => {
  const result = await sonosManager.GetRootPage(service);
  return result;
});

ipcMain.handle('getMetadata', async (event, service, id) => {
  const result = await sonosManager.GetMetadata(service, id);
  return result;
});

ipcMain.handle('seek', async (event, time) => {
  await sonosManager.SeekToPosition(time);
  return 'Seeked';
});

ipcMain.handle('next', async (event) => {
  await sonosManager.Next();
  return 'Next';
});

ipcMain.handle('previous', async (event) => {
  await sonosManager.Previous();
  return 'Previous';
});

ipcMain.handle('togglePlayback', async (event) => {
  await sonosManager.TogglePlayback();
  return 'Toggled';
});

ipcMain.handle('getPlaybackState', async (event) => {
  const result = await sonosManager.GetPlaybackState();
  return result;
});

ipcMain.handle('getVolume', async (event) => {
  const result = await sonosManager.GetVolume();
  return result;
});

ipcMain.handle('setVolume', async (event, volume) => {
  await sonosManager.SetVolume(volume);
  return 'Volume set';
});

ipcMain.handle('jumpToPointInQueue', async (event, index) => {
  await sonosManager.JumpToPointInQueue(index);
  return 'Jumped';
});

ipcMain.handle('toggleMute', async (event) => {
  await sonosManager.ToggleMute();
  return 'Toggled';
});