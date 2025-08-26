const editor = document.getElementById('editor');
const saveBtn = document.getElementById('saveBtn');
const darkModeBtn = document.getElementById('darkModeBtn');

let darkMode = false;

// Save content as DOCX
saveBtn.addEventListener('click', async () => {
  const content = editor.innerText;
  const success = await window.electronAPI.saveDocx(content);
  if (success) alert('Document saved successfully!');
});

// Toggle dark/light mode
darkModeBtn.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  document.getElementById('toolbar').classList.toggle('dark-mode', darkMode);
});
