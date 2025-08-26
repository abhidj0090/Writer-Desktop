const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveDocx: (content) => ipcRenderer.invoke('save-docx', content)
});
