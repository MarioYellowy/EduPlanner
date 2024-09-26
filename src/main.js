const { BrowserWindow } = require('electron')

let window;
function hola() {
    console.log('holis')
};

function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    window.loadFile('src/ui/index.html')


}

module.exports = {
    createWindow,
    hola
};