const messagesBtn = document.getElementById("messages-btn");
const closeMessagesBtn = document.getElementById("close-messages-btn");
const messagesContainer = document.getElementById("messages");
const messagesTabBtn = document.getElementById("messages-tab-btn");
const participantsTabBtn = document.getElementById("participants-tab-btn");
const messagesContent = document.getElementById("messages-content");
const participantsContent = document.getElementById("participants-content");
const sidePanel = document.getElementById("side-panel");
const sentMessageContainer = document.getElementById("send-message-container");

messagesBtn.addEventListener("click", () => {
  sidePanel.style.display = "block";
});

closeMessagesBtn.addEventListener("click", () => {
  sidePanel.style.display = "none";
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    if (sidePanel.style.display !== "block") sidePanel.style.display = "block";
  }

  if (window.innerWidth < 1024) {
    if (sidePanel.style.display !== "none") sidePanel.style.display = "none";
  }
});

messagesTabBtn.addEventListener("click", () => {
  messagesTabBtn.classList.add("tab-active");
  participantsTabBtn.classList.remove("tab-active");
  messagesContent.style.display = "block";
  participantsContent.style.display = "none";
  sentMessageContainer.style.display = "block";
});

participantsTabBtn.addEventListener("click", () => {
  participantsTabBtn.classList.add("tab-active");
  messagesTabBtn.classList.remove("tab-active");
  participantsContent.style.display = "block";
  messagesContent.style.display = "none";
  sentMessageContainer.style.display = "none";
});

// Copy meeting code to clipboard
const copyToClipboard = () => {
  const meetingCode = document.getElementById("meeting-code").innerHTML;

  navigator.clipboard
    .writeText(meetingCode)
    .then(() => {
      document.getElementById("meeting-code").innerHTML = "Copied!";
      document.getElementById("copy-btn").classList.add("bg-green-500");
      setTimeout(() => {
        document.getElementById("meeting-code").innerHTML = meetingCode;
        document.getElementById("copy-btn").classList.remove("bg-green-500");
      }, 1000);
    })
    .catch((err) => {
      console.error("Unable to copy text: " + err);
    });
};

document.getElementById("copy-btn").addEventListener("click", copyToClipboard);

// Remove popup message on cross button click
const removePopup = (e) => {
  console.log("Event");
};

document.getElementById("popup-close-btn", removePopup);
