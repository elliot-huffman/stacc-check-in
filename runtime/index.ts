import { Menu, app as electron } from 'electron';
import { DeepLinkEngine } from './core/DeepLink.js';
import type { WindowReference } from './Utility/types/global.js';
import { startWindow } from './windows/main.js';
import { initializeIpc } from './windows/shared/ipcConfiguration.js';

// Disable the built-in menu in production mode
if (electron.isPackaged) { Menu.setApplicationMenu(null); }

/** Instance of the deep link engine to handle deep links. */
const deepLinkRouter = DeepLinkEngine.getInstance();

/** Flag that indicates if another instance of the application is already running. */
const isFirstInstance = electron.requestSingleInstanceLock();

/** Container for references to application windows used by electron. */
const windowReference: WindowReference = { 'mainWindow': null };

// Check if the current instance if the primary instance on the system.
if (!isFirstInstance) {
    // Close the non-primary instance of the app.
    electron.quit();
} else {
    // Extract the deep link from a second instance before it is killed and pass it to the main instance.
    electron.on('second-instance', (_event, commandLine) => {
        // Check if a main window is initialized before interaction to prevent crashes.
        if (windowReference.mainWindow) {
            // Check if the main window is hidden and show it if it is so that the user can see the result of their deep link interaction.
            if (windowReference.mainWindow.isMinimized()) {
                // Restore the main window if it is minimized so
                windowReference.mainWindow.restore();
            }

            // Ensure that the main window is on top of other windows and that it has focus so that user input lands in it
            windowReference.mainWindow.focus();
        }

        // Process the deep link provided by the second instance of the app.
        deepLinkRouter.deepLinkHandler(commandLine[commandLine.length - 1] ?? '');
    });

    // Handle deep links on MacOS.
    electron.on('open-url', (_event, url) => { deepLinkRouter.deepLinkHandler(url); });

    // Wait to ensure that the Electron is ready before starting main window render to prevent crashes.
    await electron.whenReady();

    // Render Main UI
    await startWindow(electron.getAppPath(), windowReference);

    // Init IPC
    initializeIpc();

    // Pass a deep link to the router if one exists
    deepLinkRouter.deepLinkHandler(process.argv[process.argv.length - 1] ?? '');
}

// Close the background process when all windows are closed. This is because the app runs in the background like on MacOS for all OSs by default.
electron.on('window-all-closed', () => { electron.quit(); });
