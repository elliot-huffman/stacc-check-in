/** Initialize the Inter Process Communication (IPC) bridge for all of the window instances. */
export function initializeIpc(): void {
    // No IPC to initialize in the Windows runtime since all IPC is handled in the preload script and the main process doesn't need to set up any listeners for it.
    return;
}
