const meetingForm = document.getElementById("meeting-form");
const newMeetingBtn = document.getElementById("new-meeting-btn");

meetingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const meetingCode = document.getElementById("meeting-code").value;
  window.location = `lobby.html?meeting=${meetingCode}`;
});

newMeetingBtn.addEventListener("click", () => {
  let meetingCode = "";

  for (let i = 0; i < 5; ++i) {
    meetingCode +=
      Math.random().toString(36).substring(2, 5) + (i != 4 ? "-" : "");
  }

  window.location = `lobby.html?meeting=${meetingCode}`;
});
