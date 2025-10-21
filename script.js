// script.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

/* --- Firebase config (your project) --- */
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

/* --- Elements --- */
const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const usernameInput = document.getElementById("usernameInput");
const enterBtn = document.getElementById("enterBtn");
const messagesDiv = document.getElementById("messages");
const composer = document.getElementById("composer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userBadge = document.getElementById("userBadge");
const logoutBtn = document.getElementById("logoutBtn");

let username = "";
let gender = "";

/* --- Helpers --- */
function $(sel){return document.querySelector(sel)}
function formatTime(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

/* --- Login flow (remember user in localStorage) --- */
function initFromLocal(){
  const storedName = localStorage.getItem("bca_username");
  const storedGender = localStorage.getItem("bca_gender");
  if(storedName && storedGender){
    username = storedName;
    gender = storedGender;
    enterChat();
  }
}
initFromLocal();

enterBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const genderRad = document.querySelector('input[name="gender"]:checked');
  if(!name){
    alert("Please enter your name!");
    return;
  }
  if(!genderRad){
    alert("Please select gender!");
    return;
  }
  username = name;
  gender = genderRad.value;
  // persist
  localStorage.setItem("bca_username", username);
  localStorage.setItem("bca_gender", gender);
  enterChat();
});

function enterChat(){
  loginPage.classList.add("page--hidden");
  chatPage.classList.remove("page--hidden");
  chatPage.setAttribute("aria-hidden","false");
  userBadge.textContent = `${username} · ${gender}`;
  listenMessages();
}

/* Logout */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("bca_username");
  localStorage.removeItem("bca_gender");
  username = "";
  gender = "";
  messagesDiv.innerHTML = "";
  chatPage.classList.add("page--hidden");
  loginPage.classList.remove("page--hidden");
  loginPage.querySelector("input")?.focus();
});

/* Send message (on button or Enter) */
composer.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});
sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage(){
  const text = messageInput.value.trim();
  if(!text) return;
  const messagesRef = ref(db, "messages");
  const newRef = push(messagesRef);
  set(newRef, {
    user: username,
    gender: gender,
    text: text,
    timestamp: Date.now()
  }).catch(err => console.error("Write failed:", err));
  messageInput.value = "";
}

/* --- Listen for incoming messages --- */
let started = false;
function listenMessages(){
  if(started) return;
  started = true;
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, (snap) => {
    const msg = snap.val();
    if(!msg) return;
    appendMessage(msg);
  });
}

/* Append message element */
function appendMessage(msg){
  const el = document.createElement("div");
  el.className = "message " + ((msg.user === username) ? "self" : "other");

  const ts = msg.timestamp || Date.now();
  const time = formatTime(ts);

  // gender badge color variation
  const genderBadge = `<span class="gender-badge">${(msg.gender||"")}</span>`;

  el.innerHTML = `
    <span class="metaLine"><span class="user">${escapeHtml(msg.user)}</span>${genderBadge} <span style="color:var(--muted)">· ${time}</span></span>
    <div class="text">${escapeHtml(msg.text)}</div>
  `;

  messagesDiv.appendChild(el);
  // keep latest visible
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* Basic escaping for messages */
function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

/* Shortcut keys */
messageInput.addEventListener("keydown",(e)=>{
  if(e.key === "Escape"){
    // go back to login
    logoutBtn.click();
  }
});

/* Accessibility: focus composer when chat opens */
document.addEventListener("transitionend", () => {
  if(!loginPage.classList.contains("page--hidden")){
    usernameInput.focus();
  } else {
    messageInput.focus();
  }
});
