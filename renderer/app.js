const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const darkModeBtn = document.getElementById('darkModeBtn');

let darkMode = false;

// ---- Formatting Helpers ----
function format(command) {
  document.execCommand(command, false, null);
}

function formatBlock(block) {
  document.execCommand("formatBlock", false, block);
}

// ---- Save as DOCX ----
saveBtn.addEventListener('click', async () => {
  const htmlContent = editor.innerHTML;
  const success = await window.electronAPI.saveDocx(htmlContent);
  if (success) alert('Document saved successfully!');
});

// ---- Dark Mode ----
darkModeBtn.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  document.getElementById('toolbar').classList.toggle('dark-mode', darkMode);
});
