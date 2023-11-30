// renderer.js

const datebutton = document.getElementById('datebutton');
const dateElement = document.getElementById('dateid');

datebutton.addEventListener('click', async () => {
  const currDate = await window.electronAPI.doQuery();
  dateElement.innerText = currDate;
});

const logonbutton = document.getElementById('logon');
const usernameElement = document.getElementById('un');
const passwordElement = document.getElementById('pw');
const connectStringElement = document.getElementById('cs');

logonbutton.addEventListener('click', () => {
  window.electronAPI.createAppConnectionPool(usernameElement.value, passwordElement.value, connectStringElement.value);
});
