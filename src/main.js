const {BrowserWindow} = require('electron')
let window

function createWindow() {
    window = new BrowserWindow({
        width: 1920,
        height: 1280,
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.loadFile('src/ui/index.html')
}
    
module.exports = {
    createWindow
}