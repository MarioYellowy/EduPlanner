const { app, BrowserWindow} = require('electron');
const {getConnection} = require("./database")

function createWindow() {
    const window = new BrowserWindow({
        width: 1920,
        height: 1280,
        webPreferences: {
            nodeIntegration: true,     
            contextIsolation: false,      
        }
    })
    window.loadFile('src/ui/login/login.html')
}

app.whenReady().then(() => {
    createWindow()
  })

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
