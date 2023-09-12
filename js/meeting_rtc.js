const APP_ID = "";

let uid = sessionStorage.getItem("uid");
if (!uid) {
  uid = String(Math.floor(Math.random() * 1000000000));
  sessionStorage.setItem("uid", uid);
}

const token = null;

let client;

let rtmClient;
let channel;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let meetingId = urlParams.get("meeting");
let camera = urlParams.get("camera");
let microphone = urlParams.get("microphone");

if (!meetingId) {
  window.location = "index.html";
}

document.getElementById("meeting-code").innerHTML = meetingId;

let display_name = sessionStorage.getItem("display_name");
if (!display_name) {
  window.location = "lobby.html?meeting=" + meetingId;
}

if (!camera) {
  camera = true;
}

if (!microphone) {
  microphone = true;
}

let localTracks = [];
let remoteTracks = {};

let localScreenTracks;
let sharingScreen = false;

const joinMeeting = async () => {
  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ token, uid });

  await rtmClient.addOrUpdateLocalUserAttributes({ name: display_name });

  channel = await rtmClient.createChannel(meetingId);
  await channel.join();

  channel.on("MemberJoined", handleMemberJoined);
  channel.on("MemberLeft", handleMemberLeft);
  channel.on("ChannelMessage", handleChannelMessage);

  getMembers();

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, meetingId, token, uid);

  client.on("user-published", handleUserPublished);
  client.on("user-left", handleUserLeft);

  joinStream();
};

joinMeeting();

const joinStream = async () => {
  // {},
  // {
  //   encoderConfig: {
  //     width: { min: 640, max: 1920, ideal: 1920 },
  //     height: { min: 480, max: 1080, ideal: 1080 },
  //   },
  // }
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  const playerContainer = `<div id="stream-${uid}" class="secondary-video-stream flex-none bg-black w-32 h-20 rounded-lg overflow-hidden stream-box"></div>`;

  if (document.getElementById("primary-video-stream").childElementCount === 0) {
    document
      .getElementById("primary-video-stream")
      .setAttribute("id", `stream-${uid}`);
  } else {
    document
      .getElementById("secondary-all-video-streams")
      .insertAdjacentHTML("beforeend", playerContainer);
  }

  localTracks[1].play(`stream-${uid}`);
  localTracks[0].play();

  if (camera === "false") {
    await localTracks[1].setMuted(true);
    document.getElementById("camera-btn").classList.add("bg-red-500");
  }

  if (microphone === "false") {
    await localTracks[0].setMuted(true);
    document.getElementById("mic-btn").classList.add("bg-red-500");
  }

  // Publish the tracks
  await client.publish([localTracks[0], localTracks[1]]);
};

const handleUserPublished = async (user, mediaType) => {
  if (user.uid === uid) return;
  remoteTracks[user.uid] = user;

  await client.subscribe(user, mediaType);

  let playerContainer = document.getElementById(`stream-${user.uid}`);

  if (playerContainer === null) {
    const playerContainer = `<div id="stream-${user.uid}" class="secondary-video-stream flex-none bg-black w-32 h-20 rounded-lg overflow-hidden stream-box"></div>`;

    document
      .getElementById("secondary-all-video-streams")
      .insertAdjacentHTML("beforeend", playerContainer);

    // Add event listener to switch primary video stream
    document
      .getElementById(`stream-${user.uid}`)
      .addEventListener("click", switchPrimaryVideoStream);
  }

  if (mediaType === "video") {
    user.videoTrack.play(`stream-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

const handleUserLeft = async (user) => {
  delete remoteTracks[user.uid];

  document.getElementById(`stream-${user.uid}`).remove();
};

let primaryVideoStreamContainer = document.getElementById(
  "primary-video-container"
);
let secondaryVideoStreams = document.getElementsByClassName(
  "secondary-video-stream"
);

let primaryVideoStreamUserId = uid;

const switchPrimaryVideoStream = (e) => {
  const primaryStream = primaryVideoStreamContainer;
  const secondaryStream = e.currentTarget;

  // Get the single child nodes from primaryStream and secondaryStream
  const primaryChild = primaryStream.children[0];
  const secondaryChild = secondaryStream.children[0];

  // Swap the children by appending them to each other's parent
  secondaryChild.style.height = "22rem";
  primaryChild.style.height = "5rem";
  primaryStream.appendChild(secondaryChild);
  secondaryStream.appendChild(primaryChild);
};

for (let i = 0; i < secondaryVideoStreams.length; i++) {
  secondaryVideoStreams[i].addEventListener("click", switchPrimaryVideoStream);
}

// Toggle camera on/off
const toggleCamera = async (e) => {
  const cameraBtn = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    cameraBtn.classList.remove("bg-red-500");
  } else {
    await localTracks[1].setMuted(true);
    cameraBtn.classList.add("bg-red-500");
  }
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

// Toggle mic on/off
const toggleMic = async (e) => {
  const micBtn = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    micBtn.classList.remove("bg-red-500");
  } else {
    await localTracks[0].setMuted(true);
    micBtn.classList.add("bg-red-500");
  }
};

document.getElementById("mic-btn").addEventListener("click", toggleMic);

// Toggle screen share on/off
const toggleScreenShare = async (e) => {
  let screenBtn = e.currentTarget;
  let cameraBtn = document.getElementById("camera-btn");

  if (!sharingScreen) {
    screenBtn.classList.add("bg-blue-500");
    cameraBtn.classList.add("hidden");
    sharingScreen = true;

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();
    document.getElementById(`stream-${uid}`).replaceChildren();
    localScreenTracks.play(`stream-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);
  } else {
    screenBtn.classList.remove("bg-blue-500");
    cameraBtn.classList.remove("hidden");
    sharingScreen = false;

    document.getElementById(`stream-${uid}`).replaceChildren();
    await client.unpublish([localScreenTracks]);

    await client.publish([localTracks[1]]);
    localTracks[1].play(`stream-${uid}`);
  }
};

document
  .getElementById("screen-share-btn")
  .addEventListener("click", toggleScreenShare);

// Leave meeting
const leaveMeeting = async () => {
  localTracks.forEach((track) => {
    track.stop();
    track.close();
  });

  await client.unpublish([localTracks[0], localTracks[1]]);

  if (localScreenTracks) await client.unpublish([localScreenTracks]);

  window.location = `index.html`;
};

document
  .getElementById("leave-meeting-btn")
  .addEventListener("click", leaveMeeting);
