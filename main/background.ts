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
export let mainWindow: Electron.BrowserWindow | null = null;

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

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


let server;
const msalInstance = new PublicClientApplication(msalConfig);
ipcMain.handle('auth-login', async () : Promise<AuthenticationResult> => {
  return new Promise(async (resolve, reject) => {

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