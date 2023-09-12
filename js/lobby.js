let uid = sessionStorage.getItem("uid");
if (!uid) {
  uid = String(Math.floor(Math.random() * 10000));
  sessionStorage.setItem("uid", uid);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let meetingId = urlParams.get("meeting");

if (!meetingId) {
  window.location = "index.html";
}

let localTracks = [];

let showUserVideo = async (user) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      document.getElementById("user-video").srcObject = stream;

      // Display tracks in user-video
      localTracks.push(stream.getVideoTracks()[0]);
      localTracks.push(stream.getAudioTracks()[0]);
    });
};

showUserVideo();

joinMeetingBtn.addEventListener("click", () => {
  let displayName = document.getElementById("username").value;
  if (!displayName) {
    return;
  }
  sessionStorage.setItem("display_name", displayName);

  window.location = `meeting.html?meeting=${meetingId}&camera=${camera}&microphone=${microphone}`;
});

// Switch of camera
let camera = true;
const toggleCamera = () => {
  let videoTrack = localTracks[0];
  if (camera) {
    videoTrack.enabled = false;
    camera = false;
    document.getElementById("camera-btn").classList.add("bg-red-500");
  } else {
    videoTrack.enabled = true;
    camera = true;
    document.getElementById("camera-btn").classList.remove("bg-red-500");
  }
};
document.getElementById("camera-btn").addEventListener("click", toggleCamera);

// Switch of microphone
let microphone = true;
const toggleMicrophone = () => {
  let audioTrack = localTracks[1];
  if (microphone) {
    audioTrack.enabled = false;
    microphone = false;
    document.getElementById("mic-btn").classList.add("bg-red-500");
  } else {
    audioTrack.enabled = true;
    microphone = true;
    document.getElementById("mic-btn").classList.remove("bg-red-500");
  }
};
document.getElementById("mic-btn").addEventListener("click", toggleMicrophone);
