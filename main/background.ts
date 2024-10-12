import path from 'path'
import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { SonosGroupManager } from './SonosGroupManager'
import http from 'http'
const isProd = process.env.NODE_ENV === 'production'
import url from 'url'
import AuthManager from './AuthManager'
export let mainWindow: Electron.BrowserWindow | null = null;


let authManager = new AuthManager();


if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()
  await authManager.Setup();
  authManager
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

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})


ipcMain.handle('clear-token', async () => {
  authManager.logout();
});



ipcMain.handle('auth-login', async (event, loginOptions?: {optimistic: boolean} )  => {
  await authManager.login(loginOptions);
  return authManager.getCurrentUser();
});



const sonosManager = new SonosGroupManager();

ipcMain.handle('connect', async (event, groupName) => {
  await sonosManager.Connect(groupName);
  return 'Connected';
});

ipcMain.handle('search', async (event, searchTerm, searchType, service) => {
  const result = await sonosManager.Search(searchTerm, searchType, service);
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

