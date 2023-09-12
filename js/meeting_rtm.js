const handleMemberJoined = async (memberId) => {
  console.log("New member jonied: " + memberId);
  addMemberToLobby(memberId);

  updateMembersCount();
};

const addMemberToLobby = async (memberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(memberId, ["name"]);
  const memberItem = `<div id="member-${memberId}"><p class="font-bold">🟢 ${name}</p></div>`;
  const popupMessage = `<div id="popup-${memberId}" class="bg-[#2B2D2E] p-2 rounded-lg flex flex-row space-x-2 justify-between">
                          <p>${name} just joined in!</p>
                        </div>`;

  document
    .getElementById("participants-list")
    .insertAdjacentHTML("beforeend", memberItem);

  if (memberId !== uid) {
    document
      .getElementById("popup-messages")
      .insertAdjacentHTML("beforeend", popupMessage);

    setTimeout(() => {
      document.getElementById(`popup-${memberId}`).remove();
    }, 3000);
  }
};

const removeMemberFromLobby = async (memberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(memberId, ["name"]);
  const popupMessage = `<div id="popup-${memberId}" class="bg-[#2B2D2E] p-2 rounded-lg flex flex-row space-x-2 justify-between">
                          <p>${name} just joined in!</p>
                        </div>`;

  document
    .getElementById("popup-messages")
    .insertAdjacentHTML("beforeend", popupMessage);

  setTimeout(() => {
    document.getElementById(`popup-${memberId}`).remove();
  }, 3000);

  document.getElementById(`member-${memberId}`).remove();
  updateMembersCount();
};

const handleMemberLeft = async (memberId) => {
  console.log("Member left: " + memberId);
  removeMemberFromLobby(memberId);
};

const leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);

const getMembers = async () => {
  let members = await channel.getMembers();

  members.forEach((member) => {
    addMemberToLobby(member);
  });

  updateMembersCount();
};

const updateMembersCount = async () => {
  let members = await channel.getMembers();
  document.getElementById("participants-count").innerHTML =
    "Participants: " + members.length;
};

const sendMessages = async (e) => {
  e.preventDefault();

  let message = e.target.message.value;

  let messageData = {
    type: "chat",
    message,
    name: display_name,
    timestamp: Date.now(),
    uid,
  };

  console.log(uid);

  channel.sendMessage({
    text: JSON.stringify(messageData),
  });

  addMessageToChat(messageData);

  e.target.reset();
};

const addMessageToChat = (messageData) => {
  const messagesContainer = document.getElementById("messages-content");
  let time = new Date(messageData.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  let newMessage =
    messageData.uid === uid
      ? `<div
                    class="bg-[#3D4042] w-3/4 p-2 rounded-lg rounded-br-none flex flex-row self-end float-right mb-2"
                    >
                    <div class="w-full">
                        <div class="flex flex-row justify-between text-xs">
                        <p>You</p>
                        <p>${time}</p>
                        </div>
                        <div>${messageData.message}</div>
                    </div>
                    </div>`
      : `
                    <div
                    class="bg-[#1B1A1D] w-3/4 p-2 rounded-lg rounded-bl-none flex flex-row self-end"
                    >
                    <div class="w-full">
                        <div class="flex flex-row justify-between text-xs">
                        <p>${messageData.name}</p>
                        <p>${time}</p>
                        </div>
                        <div>${messageData.message}</div>
                    </div>
                    </div>
                    `;

  messagesContainer.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector("#message-content > div:last-child");
  if (lastMessage) lastMessage.scrollIntoView();
};

document
  .getElementById("send-message-form")
  .addEventListener("submit", sendMessages);

const handleChannelMessage = async (messageData) => {
  let data = JSON.parse(messageData.text);

  if (data.type === "chat") {
    addMessageToChat(data);
  }

  // if (data.type === "hand-raise") {
  //     let handRaise = `<div class="hand-raise"><p class="font-bold">${data.display_name}</p></div>`;

  //     document
  //         .getElementById("hand-raise-list")
  //         .insertAdjacentHTML("beforeend", handRaise);
  //     }
};
