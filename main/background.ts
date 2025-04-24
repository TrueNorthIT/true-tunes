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
      click() { window.sonos.Previous() }
    },
    {
      tooltip: 'Play / Pause',
      icon: nativeImage.createFromPath(path.join(__dirname, 'images/play_pause.png')),
      click() { window.sonos.TogglePlayback() }
    },
    {
      tooltip: 'Next',
      icon: nativeImage.createFromPath(path.join(__dirname, 'images/next.png')),
      click() { window.sonos.Next() }
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

const sonosManager = new SonosGroupManager();
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



ipcMain.handle('auth-login', async (event, loginOptions?: {optimistic: boolean} )  => {
  await authManager.login(loginOptions);
  return authManager.getCurrentUser();
});


ipcMain.handle('connect', async (event, groupName) => {
  await sonosManager.Connect(groupName);
  return 'Connected';
});
ipcMain.handle('connectToServices', async (event) => {
  await sonosManager.ConnectToServices();
  return 'Connected';
});