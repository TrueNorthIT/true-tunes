import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { SonosGroupManager } from './SonosGroupManager'

const isProd = process.env.NODE_ENV === 'production'

export let mainWindow: Electron.BrowserWindow | null = null;

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
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