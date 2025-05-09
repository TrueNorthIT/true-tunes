import path from 'path'
import serve from 'electron-serve'
import AuthManager from './AuthManager'
import { createWindow } from './helpers'
import { MusicAPIService } from './MusicAPIService'
import { app, ipcMain, nativeImage, } from 'electron'
const isProd = process.env.NODE_ENV === 'production'
import { SonosGroupManager } from './SonosGroupManager'
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

export let mainWindow: Electron.BrowserWindow | null = null;
const authManager = new AuthManager();
const sonosManager = new SonosGroupManager();

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady();

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((ext) => console.log(`Added Extension:  ${ext.name}`))
    .catch((err) => console.log('An error occurred: ', err));

  await authManager.Setup();
  mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),

    },
  })

  mainWindow.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: nativeImage.createFromPath(path.join(__dirname, 'images/prev.png')),
      click() { sonosManager.Previous() }
    },
    {
      tooltip: 'Play / Pause',
      icon: nativeImage.createFromPath(path.join(__dirname, 'images/play_pause.png')),
      click() { sonosManager.TogglePlayback() }
    },
    {
      tooltip: 'Next',
      icon: nativeImage.createFromPath(path.join(__dirname, 'images/next.png')),
      click() { sonosManager.Next() }
    }
  ])


  if (isProd) {
    await mainWindow.loadURL('app://./music')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/music`)
    mainWindow.webContents.openDevTools()
  }
})()

export function registerIpcFromManager(prefix: string, instance: object) {
  const proto = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(proto)
    .filter(name =>
      typeof instance[name] === 'function' &&
      name !== 'constructor' &&
      !name.startsWith('ListenTo') // skip internal listener hooks
    );

  for (const method of methodNames) {
    ipcMain.handle(`${prefix}:${method}`, async (_event, ...args) => {
      return await instance[method](...args);
    });
  }
}

registerIpcFromManager('sonos', sonosManager);


app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})


ipcMain.handle('clear-token', async () => {
  authManager.logout();
});



ipcMain.handle('auth-login', async (event, loginOptions?: { optimistic: boolean }) => {
  await authManager.login(loginOptions);
  return authManager.getCurrentUser();
});


ipcMain.handle('connect', async (event, ipAddress: string) => {
  return await sonosManager.Connect(ipAddress);
});
ipcMain.handle('connectToServices', async (event) => {
  await sonosManager.ConnectToServices();
  return 'Connected';
});

ipcMain.handle('getArtistDetails', async (event, artistName: string) => {
  return await MusicAPIService.getArtistDetails(artistName);
});

ipcMain.handle('get-genre-info', async (_event, artistName: string, albumTitle: string) => {
  const url = `https://api.getgenre.com/search?artist_name=${encodeURIComponent(artistName)}&album_name=${encodeURIComponent(albumTitle)}&timeout=60`;

  const MAX_TIME = 60_000; // 60 seconds
  const RETRY_DELAY = 1000; // 1 second

  const fetchUntilExhausted = async (startTime: number): Promise<any> => {
    const res = await fetch(url);
    const text = await res.text();
    const data = JSON.parse(text);

    const exhausted =
      data?.analysis?.exhausted ||
      data?.album_artists?.[0]?.analysis?.exhausted;

    const elapsed = Date.now() - startTime;

    if (exhausted || elapsed >= MAX_TIME) {
      return data;
    }

    console.log(`Genre info not ready — retrying (${Math.round(elapsed / 1000)}s)...`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY));
    return fetchUntilExhausted(startTime);
  };

  try {
    const result = await fetchUntilExhausted(Date.now());
    return result;
  } catch (err) {
    console.error('Genre fetch failed:', err);
    return { error: 'Genre fetch failed' };
  }
});
