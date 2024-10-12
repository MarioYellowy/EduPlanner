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
}  

function createHomeWindow(userId) {  
    if (homeWindow) {
        homeWindow.close();
    }
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
        console.log('La ventana home ha terminado de cargar.');
        if (homeWindow && homeWindow.webContents) {
            console.log('ID de usuario enviado:', userId);
            homeWindow.webContents.send('set-user-id', userId);
        }
        if (mainWindow) {  
            mainWindow.close();  
        }  
    });  

    homeWindow.on('closed', () => {
        console.log('La ventana home ha sido cerrada.');
        homeWindow = null;
    });
}

app.whenReady().then(() => {  
    createWindow();  

    ipcMain.on('user-logged-in', (event, userId) => {  
        console.log('ID de usuario recibido en main:', userId);   
        createHomeWindow(userId);  
    });
});  

ipcMain.on('logout', () => {
    if (homeWindow) {
        homeWindow.close(); 
        createWindow();      
    }
});

app.on('window-all-closed', () => {  
    if (process.platform !== 'darwin') app.quit();  
    ipcMain.removeAllListeners();  
});
