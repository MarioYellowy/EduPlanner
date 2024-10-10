const { app, BrowserWindow, ipcMain } = require('electron');  
const { getConnection } = require("./database");  

let mainWindow;    
let homeWindow; 

function createWindow() {  
    mainWindow = new BrowserWindow({  
        width: 1920,  
        height: 1280,  
        webPreferences: {  
            nodeIntegration: true,  
            contextIsolation: false,  
        }  
    });  
    
    mainWindow.loadFile('src/ui/login/login.html');  

    ipcMain.on('user-logged-in', (event, userId) => {  
        console.log('ID de usuario recibido en main:', userId);   
        createHomeWindow(userId);  

    });  
}  

function createHomeWindow(userId) {  
    homeWindow = new BrowserWindow({  
        width: 1920,  
        height: 1280,  
        webPreferences: {  
            nodeIntegration: true,  
            contextIsolation: false,  
        }  
    });  

    homeWindow.loadFile('src/ui/home/home.html');  

    homeWindow.webContents.on('did-finish-load', () => {  
        homeWindow.webContents.send('set-user-id', userId);  
        console.log('ID de usuario enviado a home correctamente.');  
         
        if (mainWindow) {  
            mainWindow.close();  
        }  
    });  
}  

app.whenReady().then(() => {  
    createWindow();  
});  

app.on('window-all-closed', () => {  
    if (process.platform !== 'darwin') app.quit();  
});