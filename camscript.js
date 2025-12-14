const cameraSelect = document.getElementById("cameraSelect");
const resolutionSelect = document.getElementById("resolutionSelect");
const mirrorToggle = document.getElementById("mirrorToggle");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const snapshotBtn = document.getElementById("snapshotBtn");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const statusText = document.getElementById("status");
const statusIndicator = document.getElementById("statusIndicator");
const timerEl = document.getElementById("timer");

let stream = null;
let timer = null;
let seconds = 0;

/* ---------------- Timer ---------------- */
function startTimer() {
  timer = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 0;
  timerEl.textContent = "00:00";
}

/* ---------------- Camera List ---------------- */
async function loadCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  cameraSelect.innerHTML = "";

  devices
    .filter(d => d.kind === "videoinput")
    .forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      cameraSelect.appendChild(option);
    });
}

/* ---------------- Start Camera ---------------- */
async function startCamera() {
  const [width, height] = resolutionSelect.value.split("x").map(Number);

  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: cameraSelect.value ? { exact: cameraSelect.value } : undefined,
      width,
      height
    }
  });

  video.srcObject = stream;

  statusText.textContent = "Connected";
  statusText.className = "text-success";
  statusIndicator.className = "status-indicator status-success";

  startBtn.disabled = true;
  stopBtn.disabled = false;
  snapshotBtn.disabled = false;

  startTimer();
}

/* ---------------- Stop Camera ---------------- */
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  video.srcObject = null;

  statusText.textContent = "Not Connected";
  statusText.className = "text-danger";
  statusIndicator.className = "status-indicator status-danger";

  startBtn.disabled = false;
  stopBtn.disabled = true;
  snapshotBtn.disabled = true;

  stopTimer();
}

/* ---------------- Snapshot ---------------- */
function takeSnapshot() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const link = document.createElement("a");
  link.download = "webcam-test.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* ---------------- Events ---------------- */
startBtn.onclick = startCamera;
stopBtn.onclick = stopCamera;
snapshotBtn.onclick = takeSnapshot;

mirrorToggle.onchange = () => {
  video.classList.toggle("mirror", mirrorToggle.checked);
};

/* Init */
loadCameras();
navigator.mediaDevices.addEventListener("devicechange", loadCameras);
