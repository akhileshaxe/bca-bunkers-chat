// =======================
// BCA Bunkers Chat Logic
// =======================

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userBadge = document.getElementById("userBadge");
const logoutBtn = document.getElementById("logoutBtn");

let username = "";
let gender = "";
let roomId = "";
let roomName = "";
let typingTimeout;
let typingIndicator;

// =======================
// FIRST INTERFACE LOGIC
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const createRoomBtn = document.getElementById("createRoomBtn");
  const joinRoomBtn = document.getElementById("joinRoomBtn");
  const enterBtn = document.getElementById("enterBtn");
  const backBtn = document.getElementById("backBtn");
  const usernameInput = document.getElementById("usernameInput");

  let currentScreen = "main"; // main / create / join

  // Switch to Create Room
  createRoomBtn.addEventListener("click", () => {
    document.querySelector(".create-join-options").style.display = "none";
    document.querySelector(".create-room").style.display = "block";
    document.querySelector(".join-room").style.display = "none";
    backBtn.style.display = "inline-block";
    currentScreen = "create";
  });

  // Switch to Join Room
  joinRoomBtn.addEventListener("click", () => {
    document.querySelector(".create-join-options").style.display = "none";
    document.querySelector(".join-room").style.display = "block";
    document.querySelector(".create-room").style.display = "none";
    backBtn.style.display = "inline-block";
    currentScreen = "join";
  });

  // Back Button
  backBtn.addEventListener("click", () => {
    document.querySelector(".create-join-options").style.display = "block";
    document.querySelector(".create-room").style.display = "none";
    document.querySelector(".join-room").style.display = "none";
    backBtn.style.display = "none";
    currentScreen = "main";
  });

  // Create Room
  enterBtn.addEventListener("click", () => {
    username = usernameInput.value.trim();
    gender = document.querySelector('input[name="gender"]:checked').value;
    roomName = document.getElementById("roomNameInput").value.trim();

    if (!username || !roomName) {
      alert("Please enter name and room name!");
      return;
    }

    roomId = "ROOM-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    alert(`Room Created!\nRoom ID: ${roomId}`);

    startChat();
  });

  // Join Room
  document.getElementById("joinRoomConfirmBtn").addEventListener("click", () => {
    username = usernameInput.value.trim();
    gender = document.querySelector('input[name="gender"]:checked').value;
    roomId = document.getElementById("joinRoomId").value.trim().toUpperCase();
    roomName = "Joined Room";

    if (!username || !roomId) {
      alert("Please enter name and room ID!");
      return;
    }

    startChat();
  });
});

// =======================
// CHAT PAGE
// =======================
function startChat() {
  loginPage.classList.add("page--hidden");
  chatPage.classList.remove("page--hidden");

  userBadge.textContent = `${username} (${gender}) | ${roomName}`;

  messagesContainer.innerHTML = "";
  addSystemMessage(`Welcome ${username}! You joined ${roomName} (${roomId})`);

  localStorage.setItem("roomData", JSON.stringify({ username, gender, roomId, roomName }));
}

// =======================
// SEND MESSAGE
// =======================
sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage();
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  } else {
    sendTypingIndicator();
  }
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const msg = {
    user: username,
    gender,
    text,
    type: "self",
  };

  addMessage(msg);
  messageInput.value = "";
  removeTypingIndicator();
}

function addMessage({ user, gender, text, type }) {
  const div = document.createElement("div");
  div.classList.add("message", type === "self" ? "self" : "other");

  const genderBadge = `<span class="gender-badge">${gender}</span>`;
  div.innerHTML = `
    <span class="metaLine"><span class="user">${user}</span>${genderBadge}</span>
    ${text}
  `;

  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.classList.add("message", "other");
  div.innerHTML = `<span class="metaLine">🔔 System</span>${text}`;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// =======================
// TYPING INDICATOR
// =======================
function sendTypingIndicator() {
  clearTimeout(typingTimeout);
  showTypingIndicator();

  typingTimeout = setTimeout(() => {
    removeTypingIndicator();
  }, 1500);
}

function showTypingIndicator() {
  if (typingIndicator) return;
  typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "other");
  typingIndicator.textContent = "💬 Someone is typing...";
  typingIndicator.id = "typingIndicator";
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

// =======================
// LOGOUT
// =======================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("roomData");
  username = "";
  gender = "";
  roomId = "";
  roomName = "";
  chatPage.classList.add("page--hidden");
  loginPage.classList.remove("page--hidden");
  messagesContainer.innerHTML = "";
});
