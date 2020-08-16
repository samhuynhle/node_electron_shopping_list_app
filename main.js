const electron = require('electron')
const url = require('url')
const path = require('path')
const { create } = require('domain')

// grab from electron
const {app, BrowserWindow, Menu, ipcMain} = electron

// SET ENV
process.env.NODE_ENV = 'production'

let mainWindow
let addWindow
// Listen for app to be ready via electron

app.on('ready', function() {
    // Creat new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        }
    });
    // Load html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slahes: true
    }))
    // Quite app when closed
    mainWindow.on('closed', function(){
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTamplate)
    // Insert menu
    Menu.setApplicationMenu(mainMenu)
});

// Handle Add Window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences:{
            nodeIntegration: true
        }
    });
    // Load html file into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slahes: true
    }))
    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow = 'null'
    })
}

// Catch item:add
ipcMain.on('item:add', function(event, item){
    console.log(item)
    mainWindow.webContents.send('item:add', item)
    addWindow.close();
})

// Create menu template
const mainMenuTamplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                // 'darwin' is mac, 'win32' is windows
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }
]

// Handling menu for mac; add empnty opject to menu
if(process.platform == 'darwin'){
    mainMenuTamplate.unshift({})
}

// Handle developer tools for non-production environment
if(process.env.NODE_ENV != 'production'){
    mainMenuTamplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}