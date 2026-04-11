import { BrowserWindow, app as electron, session } from 'electron';
import { MAIN_SESSION_NAME } from '../store/constants/windows/sessions.js';
import type { WindowReference } from '../Utility/types/global.js';
import { assertGuardEquals } from 'typia';
import { join } from 'node:path';
import { sendStaticHtmlContent } from '../Utility/serveStatic.js';

/**
 * Starts the main application window.
 * If in dev mode, it will load the development server at localhost:3000 to enable hot reloading. If in prod mode, it will serve static HTML from the user-interface/out directory.
 * @param appPath Path to the application directory that contains the root exe.
 * @param windowReference Reference that allow centralized management of application windows across the app.
 */
export async function startWindow(appPath: string, windowReference: WindowReference): Promise<void> {
    // #region Input validation
    assertGuardEquals(appPath);
    // #endregion Input validation

    /** Folder path that containers the statically rendered user interface. */
    const staticUiDir = join(appPath, './user-interface/out/');

    /** Path to the runtime compiled components used to load standalone scripts. */
    const runtimeDir = join(appPath, './bin/');

    // Initialize the main window and store a reference to it in the provided window reference container for use in other parts of the app.
    windowReference.mainWindow = new BrowserWindow({
        'icon': join(staticUiDir, '../../assets/Logo.ico'),
        'webPreferences': {
            'partition': MAIN_SESSION_NAME,
            'preload': join(runtimeDir, 'windows/shared/mainPreload.cjs')
        }
    });

    // Check if the app is running in prod, and run from static HTML if so
    if (electron.isPackaged) {
        /** Instance of an isolated session container to ensure credentials and other sensitive content doesn't leak. */
        const sessionContainer = session.fromPartition(MAIN_SESSION_NAME);

        // Ensure that static HTML is returned instead of loading a HTTP source
        sessionContainer.protocol.handle('http', async (request) => await sendStaticHtmlContent(request, staticUiDir));
    }

    // Load the main window with the statically rendered user interface in production and the development server in development for hot reloading.
    await windowReference.mainWindow.loadURL('http://localhost:3000');
}
