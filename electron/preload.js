// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Exemplo de chamada ao backend via IPC (pode ser expandido)
    startBackup: () => ipcRenderer.invoke('backup:start'),
    // Outros métodos podem ser adicionados aqui
});
