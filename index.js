const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

const { ipcMain } = require('electron');

// to avoid scoping problems with these variables
let mainWindow;
let addWindow;


app.on('ready', () =>{
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //avoid Error: uncaught reference error require is not defined electron!!
        }
    });
    mainWindow.loadURL(`file://${__dirname}/main.html`);

    // forces the child windows to be closed, when the main window is closed
    mainWindow.on('closed', () => app.quit());

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// function to create child window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200, // height and width are in pixels
        title: 'Add New Todo',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //avoid Error: uncaught reference error require is not defined electron!!
        }
    });
    addWindow.loadURL(`file://${__dirname}/add.html`);
    addWindow.on('closed', () => addWindow = null); // runs if the 'addWindow.close();' has run
}

//receiving in the main app from a(child) window, and sending from main app to the main window
ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:add', todo);
    // debugger;
    // console.log(todo);
    addWindow.close(); //closes the child window 
});


const menuTemplate = [
    {
        label: 'File',
        submenu: [
            { 
                label: 'New Todo',
                click() { createAddWindow() }
            },

            { 
                label: 'Clear Todo',
                click() { 
                    mainWindow.webContents.send('todo:clear');
                 }
            },

            { 
                label: 'quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q', 
                
                /* accelerator property let us set the keyboard shortcut for our app 
                accelerator not only takes string say accelerator: 'Ctrl+Q',  but also allows us to
                assign an immediately invoked function. remember to put an extra set of parenthesis 
                at the end of the accelerator function call, if using if-else conditional blocks.
                */

                /* 
                ternary operator was used inside accelerator function because it is more compact that regular
                if-else statements. that ternary statement means the following:
                if (process.platform === 'darwin') {
                        return 'Command+Q';
                    } else {
                        return 'Ctrl+Q';
                    }
                */
                click() {
                    app.quit(); //quits the application
                }
            }
        ]
    }
];


// process.platform lets us determine the running OS
if (process.platform === 'darwin') {
    menuTemplate.unshift({}); // unshift takes empty array and sets as the first element of menuTemplate array
}

if (process.env.NODE_ENV !== 'production') {
    // pushing dev tools into menuTemplate
    menuTemplate.push({
        label: 'View',
        submenu: [
            { role: 'reload' }, 
            // a number of roles are pre-defined by electron behind the scene, and role is one of them. 
            // role:'reload' is a shortcut to reload the window page. ctrl+r is also set as shortcut.

            {
                label: 'Toggle Developer Tools',
                // focusedWindow is the window that is currently focused/selected by the user

                //hotkey for toggle dev tools
                accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I', 
                
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                    // toggle to devtools for focused windows
                }
            }
        ]
    });
}