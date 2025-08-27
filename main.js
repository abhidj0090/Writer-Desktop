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

ipcMain.handle('save-docx', async (event, htmlContent) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Word Document', extensions: ['docx'] }]
  });

  if (!filePath) return false;

  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
  const { JSDOM } = require('jsdom'); // need this package
  const dom = new JSDOM(htmlContent);
  const body = dom.window.document.body;

  function parseNode(node) {
    let runs = [];

    node.childNodes.forEach(child => {
      if (child.nodeType === 3) { // text
        runs.push(new TextRun(child.textContent));
      } else if (child.nodeName === 'B' || child.nodeName === 'STRONG') {
        runs.push(new TextRun({ text: child.textContent, bold: true }));
      } else if (child.nodeName === 'I' || child.nodeName === 'EM') {
        runs.push(new TextRun({ text: child.textContent, italics: true }));
      } else if (child.nodeName === 'U') {
        runs.push(new TextRun({ text: child.textContent, underline: {} }));
      } else {
        runs.push(...parseNode(child));
      }
    });

    return runs;
  }

  let paragraphs = [];
  body.childNodes.forEach(node => {
    if (node.nodeName === 'H1') {
      paragraphs.push(new Paragraph({ text: node.textContent, heading: HeadingLevel.HEADING_1 }));
    } else if (node.nodeName === 'H2') {
      paragraphs.push(new Paragraph({ text: node.textContent, heading: HeadingLevel.HEADING_2 }));
    } else if (node.nodeName === 'H3') {
      paragraphs.push(new Paragraph({ text: node.textContent, heading: HeadingLevel.HEADING_3 }));
    } else if (node.nodeName === 'UL') {
      node.querySelectorAll('li').forEach(li => {
        paragraphs.push(new Paragraph({ text: li.textContent, bullet: { level: 0 } }));
      });
    } else if (node.nodeName === 'OL') {
      node.querySelectorAll('li').forEach(li => {
        paragraphs.push(new Paragraph({ text: li.textContent, numbering: { reference: "numbering", level: 0 } }));
      });
    } else {
      paragraphs.push(new Paragraph({ children: parseNode(node) }));
    }
  });

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return true;
});

