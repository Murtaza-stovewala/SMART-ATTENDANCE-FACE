window.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("facemodels"),
    faceapi.nets.faceLandmark68Net.loadFromUri("facemodels"),
    faceapi.nets.faceRecognitionNet.loadFromUri("facemodels")
  ]);
  console.log("✅ Face API models loaded");
});

const form = document.getElementById("registerForm");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
let faceDescriptor = null;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
   
    video.srcObject = stream;
    video.style.display = "block"; // ← make sure video is visible
  } catch (err) {
    console.error("Camera access error:", err);
    alert("❌ Unable to access camera");
  }
}


async function captureFace() {
  console.log("⏳ Detecting face...");

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    alert("❌ No face detected.");
    return;
  }

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(detection, displaySize);

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 🟢 Draw green box around face
  faceapi.draw.drawDetections(canvas, resizedDetections);
  ctx.strokeStyle = "limegreen";
  ctx.lineWidth = 3;
  const box = resizedDetections.detection.box;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  faceDescriptor = Array.from(detection.descriptor);
  alert("✅ Face captured successfully");

  video.srcObject.getTracks().forEach(track => track.stop());
}


document.getElementById("captureFaceBtn").addEventListener("click", async () => {
  await startCamera();
  // Wait briefly to allow camera to warm up
  setTimeout(() => {
    captureFace(); // do face detection after stream starts
  }, 3000);
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const collegeId = document.getElementById("collegeId").value.trim();
  const password = document.getElementById("password").value.trim();

 if (!name || !collegeId || !email || !password || !faceDescriptor) {
  alert("Please fill all fields and capture your face.");
  return;
}


  try {
    const response = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/students/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, collegeId, password, faceDescriptor })
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Registration successful");
      window.location.href = "../dashboard/dashboard.html";
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("An error occurred while registering.");
  }
});
