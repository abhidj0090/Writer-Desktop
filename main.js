const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('save-docx', async (event, content) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Word Document', extensions: ['docx'] }]
  });

  if (filePath) {
    const { Document, Packer, Paragraph, TextRun } = require('docx');
    const doc = new Document({
      sections: [
        { children: [new Paragraph({ children: [new TextRun(content)] })] }
      ]
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    return true;
  }
  return false;
});
