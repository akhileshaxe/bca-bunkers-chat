import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyC09cDkib8NXK59pym0s6BHXoGtO7OImJs",
  authDomain: "bca-bunkers.firebaseapp.com",
  projectId: "bca-bunkers",
  storageBucket: "bca-bunkers.firebasestorage.app",
  messagingSenderId: "990334722791",
  appId: "1:990334722791:web:7493264f408f61fe413842",
  measurementId: "G-EEGW5M2RW0"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* Elements */
const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const usernameInput = document.getElementById("usernameInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomJoinInputContainer = document.getElementById("roomJoinInputContainer");
const confirmJoinBtn = document.getElementById("confirmJoinBtn");
const roomIdInput = document.getElementById("roomIdInput");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userBadge = document.getElementById("userBadge");
const roomInfo = document.getElementById("roomInfo");
const logoutBtn = document.getElementById("logoutBtn");

let username = "";
let gender = "";
let roomId = "";

/* Helpers */
function randomRoomId() {
  return "ROOM" + Math.floor(10000 + Math.random() * 90000);
}

/* Create Room */
createRoomBtn.onclick = () => {
  const name = usernameInput.value.trim();
  const genderRad = document.querySelector('input[name="gender"]:checked');
  if (!name) return alert("Please enter your name!");
  username = name;
  gender = genderRad.value;
  roomId = randomRoomId();
  localStorage.setItem("bca_username", username);
  localStorage.setItem("bca_gender", gender);
  localStorage.setItem("bca_room", roomId);

  // Show popup
  document.getElementById("roomIdDisplay").textContent = roomId;
  document.getElementById("roomPopup").classList.remove("hidden");
};

/* Join Room */
joinRoomBtn.onclick = () => {
  roomJoinInputContainer.style.display = "block";
};
confirmJoinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  const genderRad = document.querySelector('input[name="gender"]:checked');
  const inputId = roomIdInput.value.trim();
  if (!name || !inputId) return alert("Enter name and Room ID!");
  username = name;
  gender = genderRad.value;
  roomId = inputId;
  localStorage.setItem("bca_username", username);
  localStorage.setItem("bca_gender", gender);
  localStorage.setItem("bca_room", roomId);
  enterChat();
};

/* Enter Chat */
function enterChat() {
  loginPage.classList.add("page--hidden");
  chatPage.classList.remove("page--hidden");
  userBadge.textContent = `${username} · ${gender}`;
  roomInfo.textContent = `#${roomId}`;
  messagesDiv.innerHTML = "";
  listenMessages();
}

/* Send Message */
sendBtn.onclick = (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const msgRef = ref(db, `rooms/${roomId}/messages`);
  const newMsg = push(msgRef);
  set(newMsg, { user: username, gender, text, timestamp: Date.now() });
  messageInput.value = "";
};

/* Listen Messages */
function listenMessages() {
  const msgRef = ref(db, `rooms/${roomId}/messages`);
  onChildAdded(msgRef, (snap) => {
    const msg = snap.val();
    appendMessage(msg);
  });
}

/* Append Message */
function appendMessage(msg) {
  const el = document.createElement("div");
  el.className = "message " + (msg.user === username ? "self" : "other");
  const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
  el.innerHTML = `
    <span class="metaLine">
      <span class="user">${msg.user}</span>
      <span class="gender-badge">${msg.gender}</span>
      <span style="color:var(--muted)">· ${time}</span>
    </span>
    <div class="text">${msg.text}</div>
  `;
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* Logout & Clear Room */
logoutBtn.onclick = async () => {
  if (confirm("Exit room? Chat will be cleared.")) {
    await remove(ref(db, `rooms/${roomId}/messages`));
    localStorage.clear();
    location.reload();
  }
};

/* Popup Logic */
const popup = document.getElementById("roomPopup");
const copyBtn = document.getElementById("copyRoomBtn");
const closePopupBtn = document.getElementById("closePopupBtn");

copyBtn.onclick = () => {
  const text = document.getElementById("roomIdDisplay").textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
  });
};

closePopupBtn.onclick = () => {
  popup.classList.add("hidden");
  enterChat();
};
