// eslint-disable-next-line @typescript-eslint/no-require-imports
import electronApi = require('electron');

electronApi.contextBridge.exposeInMainWorld('electronApi', {});
